# @graphand/core

Cette librairie contient les classes et fonctions de base communes au client et au serveur de
Graphand. Voici les concepts de base de cette librairie :

## Modèles : classe `Model`

`@graphand/core` exporte les modèles utilisées dans Graphand, leurs champs ainsi que les validateurs
de chacun. Chaque modèle (`src/models/*.ts`) est une classe qui étend la classe de base `Model` (qui
contient elle même les méthodes de base nécessaires au fonctionnement de core telles que les actions
de crud, getters, setters, etc.) Pour être utilisés correctement, les modèles ont besoin d'un
adaptateur (classe `Adapter`) qui définit la manière dont le modèle interagit avec les données dans
son contexte (fonctionnement différent sur le client et sur le serveur).

La définition d'un modèle (type `ModelDefinition`) est définie par le champ `Model.definition` et
contient les attributs suivants :

- `keyField`: le champ qui sert de clé primaire pour ce modèle (en plus de l'attribut `_id` qui est
  toujours présent)
- `fields`: les champs de ce modèle (type `FieldsDefinition`)
- `validators`: les validateurs de ce modèle (type `ValidatorsDefinition`)
- `single`: si le modèle est un singleton (un seul élément de ce modèle peut exister)

Si le modèle est extensible (`Model.extensible`), Graphand cherchera un datamodel ayant le même slug
pour lui associer sa définition lors de l'initialisation du modèle (`Model.initialize`). Les modèles
extensibles sont `Account`, `Media` et `Data`. Il est donc possible de créer un datamodel ayant le
slug `accounts` pour étendre le modèle `Account` et ajouter des champs à ce modèle. Pour créer un
modèle custom, il faut créer un datamodel et définir une classe qui étend le modèle de base `Data`
avec le slug du datamodel.

### Exemple

```ts
await DataModel.create({
  slug: "list",
  definition: {
    keyField: "title",
    fields: {
      title: {
        type: FieldTypes.TEXT,
      },
      description: {
        type: FieldTypes.TEXT,
      },
    },
    validators: [
      {
        type: ValidatorTypes.REQUIRED,
        options: {
          field: "title",
        },
      },
    ],
  },
});

class ListModel extends Data {
  static slug = "list";
}

await ListModel.initialize(); // Charge la définition du datamodel "list" et l'associe au modèle

console.log(ListModel.fieldsMap.has("title")); // true
```

### Champs

Les champs du modèle sont définis dans `Model.definition.fields` ... TODO

### Validateurs

Les validateurs du modèle sont définis dans `Model.definition.validators` ... TODO

### Scope du modèle

Chaque modèle est associé à un scope (global, project ou env). Le scope global est utilisé pour les
modèles accessibles globalement dans graphand (`User`, `Project`, `Organization`, etc.) Les autres
scopes sont liés à un projet: le scope `project` est utilisé pour les modèles accessibles sans
différenciation dans tous les environnements du projet (`Key`, `Media`, etc.) alors que le scope
`env` est utilisé pour les modèles déclinés en fonction de l'environnement (`Account`, `DataModel`,
etc.). Ainsi, les médias (modèle `Media`) sont accessibles dans tout le projet, sans différenciation
d'un environnement à l'autre (si un média est modifié ou supprimé, il le sera sur tous les
environnements) alors que les comptes (modèle `Account`) seront liés à un environnement (si un
compte est modifié ou supprimé sur un environnement, il ne sera pas modifié sur les autres et
inversement).

## Adaptateur : classe `Adapter`

Le rôle de cette librairie est donc de fixer les bases de la structure de Graphand. Ensuite, les
actions dépendantes du contexte (serveur/client) doivent être paramétrées pour que core fonctionne
correctement. Par exemple, le serveur lit et écrit dans une base de données, tandis que le client
émet des appels HTTP vers le serveur pour y récupérer les données ou y effectuer des opérations de
lecture/écriture.

**C'est donc le rôle de l'adaptateur** : une classe qui étend la classe `Adapter` et qui sert de
paramétrage à core pour savoir comment interagir avec les données dans le contexte courant. Pour
chaque modèle, core créé une instance de cette classe. _Chaque instance de l'adaptateur a donc accès
au modèle en question via l'attribut `Adapter.prototype.model`._

Pour fonctionner avec un adaptateur, les modèles doivent être appelé avec la méthode
`Model.withAdapter`, qui prend en paramètre la classe de l'adaptateur qui sera instanciée. C'est
cette fonction qui est appelée under the hood par le client avec la méthode
`Client.prototype.getModel` et par le serveur avec la méthode `Controller.prototype.getModel` (avec
leurs adaptateurs respectifs).

```ts
class ClientAdapter extends Adapter {} // ClientAdapter décrit comment les modèles interagissent avec les données sur le client

const AccountModel = Account.withAdapter(ClientAdapter); // maintenant AccountModel sait comment lire/écrire des données et est utilisable

AccountModel.getList("..."); // exécute la méthode getList de l'adaptateur ClientAdapter
```

Si un modèle n'est pas adapté avec la méthode `Model.withAdapter`, un adapteur sera automatiquement
instancié à partir de la classe `Model.adapterClass` du modèle en question. Par exemple, l'exemple
ci-dessus peut-être réécrit de la manière suivante :

```ts
class CustomAdapter extends Adapter {}

class CustomClass extends Data {
  static slug = "example";
  static adapterClass = CustomAdapter;
}

CustomClass.getList("...");
```

`adapterClass` est hérité par les classes enfants. Il est donc possible de définir un adapteur
global à l'environnement avec `Model.adapterClass = CustomAdapter`. Ainsi, tous les modèles
existants et futurs qiu héritent de `Model` utiliseront l'adaptateur `CustomAdapter` par défaut.

Voici les méthodes et attributs que l'adaptateur permet de définir :

### `Adapter.prototype.fetcher`

`fetcher` est un object contenant plusieurs fonctions qui correspondent aux actions suivantes :

- count : compte le nombre d'éléments de ce modèle
- get : récupère un élément de ce modèle
- getList : récupère une liste d'éléments de ce modèle
- createOne : crée un élément de ce modèle
- createMultiple : crée plusieurs éléments de ce modèle
- updateOne : met à jour un élément de ce modèle
- updateMultiple : met à jour plusieurs éléments de ce modèle
- deleteOne : supprime un élément de ce modèle
- deleteMultiple : supprime plusieurs éléments de ce modèle
- getModelDefinition : récupère les informations sur ce modèle (champs, validateurs, etc.)

Chacune de ces fonctions sera appelée par le modèle via la méthode `execute`. **L'appel de celle-ci
exécutera les hooks `before` et `after` correspondants à l'action en question du fetcher.** Par
exemple, `Model.get` utilise la méthode `Model.execute('get', ...args)` qui exécutera la fonction
`get` dans `adapter.fetcher` ainsi que les hooks `before` et `after` de l'action `get`.

#### Exemple

```ts
Model.hook("before", "get", function () {
  // sera appelé avant l'appel de la méthode get du fetcher
});

Model.hook("after", "get", function () {
  // sera appelé après l'appel de la méthode get du fetcher
});

const AdaptedModel = Model.withAdapter(MyAdapter); // nécessaire pour que les actions de crud fonctionnent dans le contexte (= client.getModel(Model) sur le client et context.getModel(Model) sur le serveur)

AdaptedModel.get("..."); // exécute la methode get du fetcher de "MyAdapter" ainsi que les hooks du modèle
```

**Ces hooks sont appelés avec les paramètres de la fonction en question et peuvent les modifier. En
théorie, ces hooks peuvent permettrent d'étendre le fonctionnement du fetcher et de couvrir tous les
cas de figure à la manière d'un plugin.**

**Les hooks executés sont ceux du modèle concerné ainsi que ceux des modèles parents. Ainsi,
lorsqu'un hook est ajouté à la classe Model, il sera executé sur n'importe quel modèle (Account,
Project, etc.)**

Le payload envoyé aux hooks inclus le contexte de l'exécution (type `TransactionCtx`) qui contient
des informations utiles telles que :

- `retryToken`: Si ce symbol est émis par l'un des hooks (`throw ctx.retryToken`), alors l'opération
  sera relancée après l'exécution des hooks de la phase en cours (`before` ou `after`)
- `abortToken`: Si ce symbol est émis par l'un des hooks (`throw ctx.abortToken`), alors l'opération
  sera immédiatement stoppée. Même l'exécution des hooks de la phase en cours sera arretée
  contrairement au `retryToken`.

### `Adapter.prototype.fieldsMap`

`fieldsMap` est un objet qui lie chaque type champ existant sur graphand à la classe de son type.
Les types de champs sont tous définis par l'enum `FieldTypes` et sont les suivants :

- _FieldTypes.ID_
- _FieldTypes.ARRAY_
- _FieldTypes.TEXT_
- _FieldTypes.NUMBER_
- _FieldTypes.BOOLEAN_
- _FieldTypes.RELATION_
- _FieldTypes.DATE_
- _FieldTypes.NESTED_
- _FieldTypes.IDENTITY_

Chaque champ est donc une classe qui étend la classe de base `Field` et qui décrit la manière dont
le type de champ en question encode et décode les données dans le contexte courant. Par exemple le
champ \_id est de type différent sur le client et sur le serveur : `string` sur le client et
`ObjectId` sur le serveur. Tous les types de champs existent déjà dans `@graphand/core` et
l'adaptateur peut en surcharger seulement certaines si besoin.

#### Exemple

```ts
class CustomFieldText extends Field<FieldTypes.TEXT> {
  serialize(value: string) {
    return value.toUpperCase();
  }
}

MyAdapter.prototype.fieldsMap = {
  [FieldTypes.TEXT]: CustomFieldText,
};
```

### `Adapter.prototype.validatorsMap`

De la même manière que pour les champs, les validateurs sont définis dans le `validatorsMap`. Les
types de champs sont tous dans l'enum `ValidatorTypes` :

- _ValidatorTypes.REQUIRED_
- _ValidatorTypes.UNIQUE_
- _ValidatorTypes.BOUNDARIES_
- _ValidatorTypes.LENGTH_
- _ValidatorTypes.REGEX_
- _ValidatorTypes.SAMPLE_
- _ValidatorTypes.KEY_FIELD_
- _ValidatorTypes.DATAMODEL_SLUG_
- _ValidatorTypes.DATAMODEL_DEFINITION_

Les validateurs `DATAMODEL_SLUG` et `DATAMODEL_DEFINITION_` sont des validateurs spéciaux qui sont
utilisés seulement par le modèle `DataModel` pour vérifier que les champs `slug` et `definition`
sont valides.

### `Adapter.prototype.runValidators`

`runValidators` permet d'activer ou de désactiver les validateurs sur les actions de crud dans le
contexte. Même si les validateurs sont désactivés via cette variable, ils peuvent toujours être
exécutés via la méthode `Model.validate`.

### Exemple

Ici, le serveur exécue systématiquement les validateurs lorsqu'un élément est ajouté ou modifié
(D'où `ServerAdapter.prototype.runValidators = true`). En revanche, le client n'exécute pas les
validateurs car c'est le serveur qui gère cette partie
(`ClientAdapter.prototype.runValidators = false`). Le client peut tout de même exécuter les
validateurs si besoin (avant l'envoi d'un formulaire par exemple) avec la méthode `Model.validate`.

## Controleurs

Les controleurs sont décrits dans le fichier `controllersMap.ts`. Chaque controleur est décrit par
les attributs suivants :

- `path`: le chemin de l'endpoint pour accéder au controleur. Les paramètres sont définis avec
  `:nomDuParametre` et peuvent être optionnels avec `:nomDuParametre?`
- `methods`: les méthodes HTTP autorisées pour cet endpoint
- `secured`: si `true`, l'accès à cet endpoint nécessite une authentification
- `scope`: le scope de l'endpoint (global ou project). Si `global`, l'endpoint est accessible via
  l'instance globale de graphand. Si `project`, l'endpoint est accessible seulement sur une instance
  de projet. Si `scope` est une fonction, celle-ci sera appelée avec le modèle de la requête en
  paramètre et doit retourner `global` ou `project` en fonction du scope du modèle.

## Types

TODO ...

```js
// tsconfig.json

{
  "include": ["src", "node_modules/@graphand/core/definitions.d.ts"]
}
```
