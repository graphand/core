# @graphand/core

Cette librairie contient les classes et fonctions de base communes au client et au serveur de Graphand.
Voici les concepts de base de cette librairie :

## Modèles : classe `Model`

`@graphand/core` exporte les modèles utilisées dans Graphand, leurs champs ainsi que les validateurs de chacun.
Chaque modèle est une classe qui étend la classe de base `Model`.
Pour être utilisés correctement, les modèles ont besoin d'un adaptateur (classe `Adapter`) qui définit leur fonctionnement.

## Adaptateur : classe `Adapter`

Une fois la structure de base définie par cette librairie, certaines actions doivent être implémentées pour fonctionner différemment selon le contexte. (serveur/client)
C'est le rôle de l'adaptateur qui est une classe qui étend la classe `Adapter`. Cette classe sera instanciée par core pour chaque modèle avec le modèle en question accesible via `Adapter.prototype.model`.
Pour fonctionner, chaque modèle doit donc être appelé avec la méthode `Model.withAdapter` qui prend en paramètre la classe de l'adaptateur.
C'est cette fonction est appelée under the hood par le client avec la méthode `Client.prototype.getModel` et par le serveur avec la méthode `Controller.prototype.getModel`.

### `Adapter.prototype.fetcher`

Le `fetcher` définit le fonctionnement de plusieurs méthodes :

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

Chacune de ces méthodes sera appelée par le modèle via la méthode `execute`.
Chaque appel de celle-ci exécutera les hooks `before` et `after` correspondants à l'action en question du fetcher.
Par exemple, `Model.get` utilise la méthode `Model.execute('get', ...args)` qui exécutera la fonction `get` définie dans `adapter.fetcher` ainsi que les hooks `before` et `after` de l'action `get`.

#### Exemple

```ts
Model.hook("before", "get", function() {
    // sera appelé avant l'appel de la méthode get du fetcher
})

Model.hook("after", "get", function() {
    // sera appelé après l'appel de la méthode get du fetcher
})

Model.withAdapter(MyAdapter).get("..."); // exécute la methode get du fetcher de "MyAdapter" ainsi que les hooks du modèle
```

**Ces hooks sont appelés avec les paramètres de la fonction en question et peuvent les modifier. En théorie, ces hooks peuvent permettrent d'étendre le fonctionnement du fetcher et de couvrir tous les cas de figure à la manière d'un plugin.**

### `Adapter.prototype.fieldsMap`

Le `fieldsMap` est un objet qui définit chaque champ en fonction de son type.
Les types de champs sont tous définis par l'enum `FieldTypes` et sont les suivants :

- FieldTypes.ID
- FieldTypes.TEXT
- FieldTypes.NUMBER
- FieldTypes.BOOLEAN
- FieldTypes.RELATION
- FieldTypes.DATE
- FieldTypes.JSON
- FieldTypes.IDENTITY

Chaque champ est une classe qui étend la classe de base `Field` est qui définit la manière dont le type de champ encode et décode les données.
Tous les types de champs ont leur classe définie dans `@graphand/core` et l'adaptateur peut surcharger seulement certaines.

#### Exemple

```ts
class CustomFieldText extends Field<FieldTypes.TEXT> {
    serialize(value: string) {
        return value.toUpperCase();
    }
}

MyAdapter.prototype.fieldsMap = {
    [FieldTypes.TEXT]: CustomFieldText
}
```

### `Adapter.prototype.validatorsMap`

De la même manière que pour les champs, les validateurs sont définis dans le `validatorsMap`.
Les types de champs sont dans l'enum `ValidatorTypes` :

- ValidatorTypes.REQUIRED
- ValidatorTypes.UNIQUE
- ValidatorTypes.BOUNDARIES
- ValidatorTypes.LENGTH
- ValidatorTypes.REGEX
- ValidatorTypes.SAMPLE
- ValidatorTypes.CONFIG_KEY
- ValidatorTypes.DATAMODEL_CONFIG_KEY
