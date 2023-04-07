// @ts-check

export default {
  translation: {
    appName: 'Менеджер задач',
    flash: {
      session: {
        create: {
          success: 'Вы залогинены',
          error: 'Неправильный емейл или пароль',
        },
        delete: {
          success: 'Вы разлогинены',
        },
      },
      users: {
        create: {
          error: 'Не удалось зарегистрировать',
          success: 'Пользователь успешно зарегистрирован',
        },
        update: {
          error: 'Не удалось обновить пользователя',
          success: 'Пользователь успешно изменён',
        },
        delete: {
          error: 'Не удалось удалить пользователя',
          success: 'Пользователь успешно удалён',
        },
      },
      statuses: {
        update: {
          error: 'Не удалось изменить статус',
          success: 'Статус успешно изменён',
        },
        create: {
          error: 'Не удалось создать статус',
          success: 'Статус успешно создан',
        },
        delete: {
          error: 'Не удалось удалить статус',
          success: 'Статус успешно удалён',
        },
      },
      tasks: {
        update: {
          error: 'Не удалось изменить задачу',
          success: 'Задача успешно изменена',
        },
        create: {
          error: 'Не удалось создать задачу',
          success: 'Задача успешно создана',
        },
        delete: {
          error: 'Задачу может удалить только её автор',
          success: 'Задача успешно удалена',
        },
      },
      accessError: 'Вы не можете редактировать или удалять другого пользователя',
      authError: 'Доступ запрещён! Пожалуйста, авторизируйтесь.',
    },
    layouts: {
      application: {
        users: 'Пользователи',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
        edit: 'Изменение пользователя',
        statuses: 'Статусы',
        createStatus: 'Создание статуса',
        statusEdit: 'Изменение статуса',
        tasks: 'Задачи',
        createTask: 'Создание задачи',
        updateTask: 'Изменение задачи',
      },
    },
    views: {
      session: {
        new: {
          signIn: 'Вход',
          submit: 'Войти',
        },
      },
      users: {
        id: 'ID',
        firstName: 'Имя',
        lastName: 'Фамилия',
        fullName: 'Полное имя',
        email: 'Email',
        password: 'Пароль',
        createdAt: 'Дата создания',
        actions: 'Действия',
        delete: 'Удалить',
        update: 'Изменить',
        new: {
          submit: 'Сохранить',
          signUp: 'Регистрация',
        },
      },
      statuses: {
        id: 'ID',
        name: 'Наименование',
        createdAt: 'Дата создания',
        actions: 'Действия',
        delete: 'Удалить',
        update: 'Изменить',
        createStatus: 'Создать статус',
        create: 'Создать',
      },
      tasks: {
        id: 'ID',
        name: 'Наименование',
        status: 'Статус',
        author: 'Автор',
        executor: 'Исполнитель',
        createdAt: 'Дата создания',
        create: 'Создать задачу',
        update: 'Изменить',
        delete: 'Удалить',
        actions: 'Действия',
        description: 'Описание',
        labels: 'Метки',
        label: 'Метка',
        show: 'Показать',
        onlyMyTasks: 'Только мои задачи',
        new: {
          create: 'Создать',
        },
      },
      welcome: {
        index: {
          hello: 'Привет от Хекслета!',
          description: 'Практические курсы по программированию',
          more: 'Узнать Больше',
        },
      },
    },
  },
};
