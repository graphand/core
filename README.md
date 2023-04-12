# @graphand/core

Cette librairie contient les classes et fonctions de base communes au client et au serveur de Graphand.
Voici les concepts de base de cette librairie :

## Modèles : classe `Model`

`@graphand/core` exporte les modèles utilisées dans Graphand, leurs champs ainsi que les validateurs de chacun.
Chaque modèle (`src/models/*.ts`) est une classe qui étend la classe de base `Model` (qui contient elle même les méthodes de base nécessaires au fonctionnement de core telles que les actions de crud, getters, setters, etc.)
Pour être utilisés correctement, les modèles ont besoin d'un adaptateur (classe `Adapter`) qui définit la manière dont le modèle interagit avec les données dans son contexte (fonctionnement différent sur le client et sur le serveur).

## Adaptateur : classe `Adapter`

Le rôle de cette librairie est donc de fixer les bases de la structure de Graphand. Ensuite, les actions dépendantes du contexte (serveur/client) doivent être paramétrées pour que core fonctionne correctement.
Par exemple, le serveur lit et écrit dans une base de données, tandis que le client émet des appels HTTP vers le serveur pour y récupérer les données ou y effectuer des opérations de lecture/écriture.

**C'est donc le rôle de l'adaptateur** : une classe qui étend la classe `Adapter` et qui sert de paramétrage à core pour savoir comment interagir avec les données dans le contexte courant.
Pour chaque modèle, core créé une instance de cette classe.
_Chaque instance de l'adaptateur a donc accès au modèle en question via l'attribut `Adapter.prototype.model`._

Pour fonctionner avec un adaptateur, les modèles doivent être appelé avec la méthode `Model.withAdapter`, qui prend en paramètre la classe de l'adaptateur qui sera instanciée.
C'est cette fonction qui est appelée under the hood par le client avec la méthode `Client.prototype.getModel` et par le serveur avec la méthode `Controller.prototype.getModel` (avec leurs adaptateurs respectifs).

```ts
class ServerAdapter extends Adapter {} // ServerAdapter décrit comment les modèles interagissent avec les données sur le serveur

const AccountModel = Account.withAdapter(ServerAdapter); // maintenant AccountModel sait comment lire/écrire des données et est utilisable
```

la variable globale **GLOBAL_ADAPTER** peut être utilisée pour définir un adaptateur par défaut pour tous les modèles. La méthode `Client.prototype.declareGlobally` utilise cette variable pour permettre d'utiliser les modèles avec l'adaptateur du client en question sans avoir à appeler `Client.prototype.getModel` à chaque fois.

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

Chacune de ces fonctions sera appelée par le modèle via la méthode `execute`.
**L'appel de celle-ci exécutera les hooks `before` et `after` correspondants à l'action en question du fetcher.**
Par exemple, `Model.get` utilise la méthode `Model.execute('get', ...args)` qui exécutera la fonction `get` dans `adapter.fetcher` ainsi que les hooks `before` et `after` de l'action `get`.

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

**Ces hooks sont appelés avec les paramètres de la fonction en question et peuvent les modifier. En théorie, ces hooks peuvent permettrent d'étendre le fonctionnement du fetcher et de couvrir tous les cas de figure à la manière d'un plugin.**

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
- _FieldTypes.JSON_
- _FieldTypes.IDENTITY_

Chaque champ est donc une classe qui étend la classe de base `Field` et qui décrit la manière dont le type de champ en question encode et décode les données dans le contexte courant. Par exemple le champ \_id est de type différent sur le client et sur le serveur : `string` sur le client et `ObjectId` sur le serveur.
Tous les types de champs existent déjà dans `@graphand/core` et l'adaptateur peut en surcharger seulement certaines si besoin.

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

De la même manière que pour les champs, les validateurs sont définis dans le `validatorsMap`.
Les types de champs sont tous dans l'enum `ValidatorTypes` :

- _ValidatorTypes.REQUIRED_
- _ValidatorTypes.UNIQUE_
- _ValidatorTypes.BOUNDARIES_
- _ValidatorTypes.LENGTH_
- _ValidatorTypes.REGEX_
- _ValidatorTypes.SAMPLE_
- _ValidatorTypes.CONFIG_KEY_
- _ValidatorTypes.DATAMODEL_CONFIG_KEY_

### `Adapter.prototype.runValidators`

`runValidators` permet d'activer ou de désactiver les validateurs sur les actions de crud dans le contexte.
Même si les validateurs sont désactivés via cette variable, ils peuvent toujours être exécutés via la méthode `Model.validate`.

### Exemple

Ici, le serveur exécue systématiquement les validateurs lorsqu'un élément est ajouté ou modifié (D'où `ServerAdapter.prototype.runValidators = true`).
En revanche, le client n'exécute pas les validateurs car c'est le serveur qui gère cette partie (`ClientAdapter.prototype.runValidators = false`). Le client peut tout de même exécuter les validateurs si besoin (avant l'envoi d'un formulaire par exemple) avec la méthode `Model.validate`.
