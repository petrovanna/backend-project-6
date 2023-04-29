// @ts-check

import i18next from 'i18next';

export default (app) => {
  app
    .get('/tasks', { name: 'tasks', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.user;
      const {
        executor, status, label, onlyMyTasks,
      } = req.query;

      const { query } = req;

      const tasksQuery = app.objection.models.task.query().withGraphJoined('[creator, executor, status, label]');

      tasksQuery.skipUndefined().modify('filterExecutor', executor || undefined);
      tasksQuery.skipUndefined().modify('filterStatus', status || undefined);
      tasksQuery.skipUndefined().modify('filterLabel', label || undefined);

      if (onlyMyTasks === 'on') {
        tasksQuery.skipUndefined().modify('filterCreator', id || undefined);
      }

      const [tasks, users, statuses, labels] = await Promise.all([
        tasksQuery,
        app.objection.models.user.query(),
        app.objection.models.taskStatus.query(),
        app.objection.models.label.query(),
      ]);

      reply.render('tasks/index', {
        tasks, statuses, users, labels, query,
      });
      return reply;
    })
    .get('/tasks/new', { name: 'newTask', preValidation: app.authenticate }, async (req, reply) => {
      const task = new app.objection.models.task();
      const users = await app.objection.models.user.query();
      const statuses = await app.objection.models.taskStatus.query();
      const labels = await app.objection.models.label.query();

      reply.render('tasks/new', {
        task, statuses, users, labels,
      });
      return reply;
    })
    .post('/tasks', { name: 'createTask', preValidation: app.authenticate }, async (req, reply) => {
      const task = new app.objection.models.task();
      const users = await app.objection.models.user.query();
      const statuses = await app.objection.models.taskStatus.query();
      const labels = await app.objection.models.label.query();
      const { id: creatorId } = req.user;
      const {
        name, description, statusId, executorId, label,
      } = req.body.data;
      const taskData = {
        name,
        description,
        statusId: Number(statusId),
        executorId: Number(executorId),
        creatorId,
        label: Number(label),
      };
      task.$set(taskData);

      try {
        const validTask = await app.objection.models.task.fromJson(taskData);
        await app.objection.models.task.query().insert(validTask);
        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.tasks.create.error'));
        reply.render('tasks/new', {
          task, users, statuses, errors: data, labels,
        });
      }

      return reply;
    })
    .get('/tasks/:id/edit', { name: 'editTask', preValidation: app.authenticate }, async (req, reply) => {
      const task = await app.objection.models.task.query().findById(req.params.id);
      const statuses = await app.objection.models.taskStatus.query();
      const users = await app.objection.models.user.query();
      const labels = await app.objection.models.label.query();
      const selectedLabel = await app.objection.models.task.query().withGraphJoined('[label]').findById(req.params.id);

      reply.render('/tasks/edit', {
        task, statuses, users, labels, selectedLabel,
      });
      return reply;
    })
    .patch('/tasks/:id', async (req, reply) => {
      const { id } = req.params;
      const task = await app.objection.models.task.query().findById(id);
      const users = await app.objection.models.user.query();
      const statuses = await app.objection.models.taskStatus.query();
      const labels = await app.objection.models.label.query();
      const { id: creatorId } = req.user;
      const {
        name, description, statusId, executorId, label,
      } = req.body.data;
      // console.log('00000000000000000000000000000000000000000000', description);
      // console.log('11111111111111111111111111111111111111111111', label);
      // console.log('22222222222222222222222222222222222222222222', statusId);
      console.log('33333333333333333333333333333333333333333333', req.body.data);
      // console.log('44444444444444444444444444444444444444444444', labels);

      const taskData = {
        name,
        description,
        statusId: Number(statusId),
        executorId: Number(executorId),
        creatorId,
        label: Number(label),
      };
      console.log('555555555555555555555555555555555555555555556', taskData);
      try {
        await task.$query().update(taskData);
        req.flash('info', i18next.t('flash.tasks.update.success'));
        reply.redirect('/tasks');
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.tasks.update.error'));
        reply.redirect((`/tasks/${id}/edit`), task, users, statuses, { errors: data }, labels);
      }
    })
    .delete('/tasks/:id', { name: 'deleteTask', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      try {
        await app.objection.models.task.query().deleteById(id);
        req.flash('info', i18next.t('flash.tasks.delete.success'));
      } catch (err) {
        req.flash('error', i18next.t('flash.tasks.delete.error'));
        reply.redirect(app.reverse('tasks'));
      }
      reply.redirect(app.reverse('tasks'));
      return reply;
    })
    .get('/tasks/:id', { name: 'taskPage', preValidation: app.authenticate }, async (req, reply) => {
      const task = await app.objection.models.task.query().withGraphJoined('[creator, executor, status, label]').findById(req.params.id);

      reply.render('tasks/task', { task });
      return reply;
    });
};
