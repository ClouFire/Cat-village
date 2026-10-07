# Cat-village
It is a cat-village game. Clone of "cats &amp; soup". Powered by Phaser
# Cat Village Architecture

## Цель документа

Этот документ описывает базовую архитектуру проекта Cat Village: какие слои есть в приложении, за что они отвечают и в каком направлении могут идти зависимости.

## Основная идея

Проект строится вокруг разделения на несколько слоёв:

```txt
bootstrap
→ presentation
→ application
→ domain
```

`domain` — внутренний слой. Он не должен знать про Phaser, UI, сцены, хранилище состояния или способ запуска приложения.

`application` связывает пользовательские действия и доменные правила.

`presentation` отвечает за отображение, Phaser-сцены и игровые объекты.

`bootstrap` собирает приложение и передаёт зависимости в нужные места.

## Public

В `public` хранятся статические файлы веб-версии проекта: иконки, изображения, стили и другие ассеты, которые используются браузером напрямую.

## src/main.ts

`main.ts` — главная точка входа в приложение.

Он создаёт экземпляр игры через `createGameApp` и подключает глобальные стили.

Основные зависимости:

```txt
bootstrap/createGameApp
style.css
```

## src/bootstrap/createGameApp.ts

`createGameApp` — composition root проекта.

Здесь собирается приложение:

- создаётся начальный `GameState`;
- создаётся `GameStore`;
- создаётся `GameLoop`;
- создаются application use cases;
- создаётся стартовая сцена `VillageScene`;
- настраивается Phaser config;
- возвращается `new Phaser.Game(config)`.

`bootstrap` может знать про все слои, потому что его задача — собрать приложение.

## src/application

`application` — слой сценариев приложения.

Он связывает внешнее действие с доменной логикой. Например, пользователь нажал на workstation, выбрал кота или собрал готовую продукцию.

### GameLoop

`GameLoop` отвечает за регулярное обновление состояния игры.

В `tick(elapsedMs)` вызываются доменные системы, которые симулируют движение, отдых котов и производственный цикл workstation.

`elapsedMs` — количество миллисекунд, прошедшее с прошлого кадра.

### use-cases

`application/use-cases` содержит сценарии приложения.

Use case получает действие извне, читает или обновляет `GameStore`, вызывает доменное правило и возвращает результат.

Примеры:

```txt
assignCatToWorkstationUseCase
collectWorkstationProductionUseCase
workstationClickActionUseCase
```

### store

`GameStore` хранит текущий `GameState` и безопасно обновляет его через функции преобразования состояния.

## src/domain

`domain` — слой игровой модели и бизнес-правил.

Он не зависит от Phaser, UI, `GameStore`, сцен или браузера.

### configs

`domain/configs` содержит допустимые типы и конфигурационные значения, которые используются в доменной модели.

Примеры:

```txt
ProductionTypes
WorkstationType
WorkstationStates
```

### entities

`domain/entities` содержит основные сущности игры.

Примеры:

```txt
GameState
Cat
Workstation
Inventory
```

### value-objects

`domain/value-objects` содержит общие типы-значения.

Пример:

```txt
Position
```

### rules

`domain/rules` содержит чистые правила, которые обычно вызываются из use cases.

Правила отвечают на пользовательские действия и возвращают новый `GameState` или ошибку.

Примеры:

```txt
assignCatToWorkstation
collectWorkstationProduction
moveCat
```

### systems

`domain/systems` содержит симуляционные системы, которые вызываются из `GameLoop`.

Системы не зависят от UI. Они обновляют состояние игры на основании времени и текущего состояния сущностей.

Примеры:

```txt
MovementSystem
RestingSystem
WanderingSystem
WorkstationCycleSystem
```

## src/presentation

`presentation` отвечает за отображение игры.

Здесь находятся Phaser-сцены, игровые объекты и UI-элементы.

Примеры:

```txt
VillageScene
CatView
KitchenView
CurrencyView
```

`presentation` может вызывать application use cases, но не должна напрямую запускать `domain/rules` или `domain/systems`.

## src/infrastructure

`infrastructure` предназначен для внешних интеграций.

В будущем здесь могут находиться:

- сохранение в IndexedDB;
- работа с backend;
- получение серверного времени;
- адаптеры внешних сервисов.

## Production cycle

Текущий производственный цикл workstation выглядит так:

```txt
cat assigned to workstation
→ workstation idle + cat idle
→ cat moving to workstation
→ workstation waiting_for_cat
→ cat arrived
→ workstation producing + cat cooking
→ production finished
→ workstation ready + cat resting
→ player collects production
→ workstation idle
→ cat can start next cycle after rest timer
```

`workstationId` у кота и `assignedCatId` у workstation не сбрасываются после завершения production. Это постоянная связь назначения.

## Dependency rules

Разрешённое направление зависимостей:

```txt
bootstrap → presentation → application → domain
```

Запрещено:

```txt
domain → application
domain → presentation
domain → Phaser
application → presentation
application → Phaser
presentation → domain/rules напрямую
presentation → domain/systems напрямую
```

Эти правила можно контролировать через `dependency-cruiser`.