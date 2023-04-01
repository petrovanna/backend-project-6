// @ts-check

// import i18next from 'i18next';

export default (app) => {
  app
    .get('/statuses', { name: 'statuses', preValidation: app.authenticate }, async (req, reply) => {
      const statuses = await app.objection.models.taskStatus.query();
      // console.log('ddddddddddddddddd', statuses);
      reply.render('statuses/index', { statuses });
      return reply;
    });
};

/* GET /statuses - страница со списком всех статусов
GET /statuses/new - страница создания статуса
GET /statuses/:id/edit - страница редактирования статуса
POST /statuses - создание нового статуса
PATCH /statuses/:id - обновление статуса
DELETE /statuses/:id - удаление статуса */
