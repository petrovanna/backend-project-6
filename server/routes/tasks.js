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

      const tasksQuery = app.objection.models.task.query().withGraphJoined('[creator, executor, status, labels]');

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
        name, description, statusId, executorId, label: labelArr = [],
      } = req.body.data;

      const taskData = {
        name,
        description,
        statusId: Number(statusId),
        executorId: Number(executorId),
        creatorId,
      };
      const labelIds = [...labelArr].map((id) => ({ id: parseInt(id, 10) }));
      task.$set({ ...taskData, labels: labelIds });

      try {
        const validTask = await app.objection.models.task.fromJson(taskData);
        await app.objection.models.task.transaction(async (trx) => {
          const newTask = {
            ...validTask,
            labels: labelIds,
          };
          const insertTask = await app.objection.models.task.query(trx).insertGraph(newTask, { relate: ['labels'] });
          return insertTask;
        });
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
      const selectedLabel = await app.objection.models.task.query().withGraphJoined('[labels]').findById(req.params.id);

      reply.render('/tasks/edit', {
        task, statuses, users, labels, selectedLabel,
      });
      return reply;
    })

    .patch('/tasks/:id', { name: 'update', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const task = await app.objection.models.task.query().findById(id);
      const users = await app.objection.models.user.query();
      const statuses = await app.objection.models.taskStatus.query();
      const labels = await app.objection.models.label.query();
      const { id: creatorId } = req.user;
      const taskId = Number(req.params.id);
      const {
        name, description, statusId, executorId, label: labelArr = [],
      } = req.body.data;

      const taskData = {
        name,
        description,
        statusId: Number(statusId),
        executorId: Number(executorId),
        creatorId,
      };

      const labelIds = [...labelArr].map((ids) => ({ id: parseInt(ids, 10) }));
      task.$set({ ...taskData, labels: labelIds });

      try {
        const validTask = await app.objection.models.task.fromJson(taskData);
        await app.objection.models.task.transaction(async (trx) => {
          const updatedTask = {
            id: taskId,
            ...validTask,
            labels: labelIds,
          };
          const insertTask = await app.objection.models.task.query(trx)
            .upsertGraph(updatedTask, { relate: true, unrelate: true });
          return insertTask;
        });
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
      const task = await app.objection.models.task.query().withGraphJoined('[creator, executor, status, labels]').findById(req.params.id);

      reply.render('tasks/task', { task });
      return reply;
    });
};
