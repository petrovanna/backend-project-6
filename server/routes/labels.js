// @ts-check

import i18next from 'i18next';

export default (app) => {
  app
    .get('/labels', { name: 'labels', preValidation: app.authenticate }, async (req, reply) => {
      const labels = await app.objection.models.label.query();
      reply.render('labels/index', { labels });

      return reply;
    })
    .get('/labels/new', { name: 'newLabel', preValidation: app.authenticate }, (req, reply) => {
      const label = new app.objection.models.label();
      reply.render('labels/new', { label });
    })
    .post('/labels', async (req, reply) => {
      const label = new app.objection.models.label();
      label.$set(req.body.data);

      try {
        const validLabel = await app.objection.models.label.fromJson(req.body.data);
        await app.objection.models.label.query().insert(validLabel);
        req.flash('info', i18next.t('flash.labels.create.success'));
        reply.redirect(app.reverse('labels'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.labels.create.error'));
        reply.render('labels/new', { label, errors: data });
      }

      return reply;
    })
    .get('/labels/:id/edit', { name: 'editLabel', preValidation: app.authenticate }, async (req, reply) => {
      const label = await app.objection.models.label.query().findById(req.params.id);
      reply.render('/labels/edit', { label });

      return reply;
    })
    .patch('/labels/:id', async (req, reply) => {
      const { id } = req.params;
      const label = await app.objection.models.label.query().findById(id);
      try {
        await label.$query().update(req.body.data);
        req.flash('info', i18next.t('flash.labels.update.success'));
        reply.redirect('/labels');
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.labels.update.error'));
        reply.redirect((`/labels/${id}/edit`), { errors: data });
      }
    })

    .delete('/labels/:id', { name: 'deleteLabel', preValidation: app.authenticate }, async (req, reply) => {
      const label = await app.objection.models.label.query().findById(req.params.id);
      const labelTasks = await label.$relatedQuery('tasks');

      if (labelTasks.length) {
        req.flash('error', i18next.t('flash.labels.delete.error'));

        return reply.redirect(app.reverse('labels'));
      }

      try {
        await app.objection.models.label.query().deleteById(req.params.id);
        req.flash('info', i18next.t('flash.labels.delete.success'));
      } catch (err) {
        req.flash('error', i18next.t('flash.labels.delete.error'));
      }

      reply.redirect(app.reverse('labels'));

      return reply;
    });
};
