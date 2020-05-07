"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  /**
   * Crea un pedido.
   *
   * @return {Object}
   */

  async create(ctx) {
    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      data.user = ctx.state.user.id;
      entity = await strapi.services.pedido.create(data, { files });
    } else {
      ctx.request.body.user = ctx.state.user.id;
      entity = await strapi.services.pedido.create(ctx.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.models.pedido });
  },

  /**
   * Modifica un pedido
   *
   * @return {Object}
   */

  async update(ctx) {
    const { id } = ctx.params;

    let entity;

    const [pedido] = await strapi.services.pedido.find({
      id: ctx.params.id,
      "user.id": ctx.state.user.id,
    });

    if (!pedido) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.pedido.update({ id }, data, {
        files,
      });
    } else {
      entity = await strapi.services.pedido.update({ id }, ctx.request.body);
    }

    return sanitizeEntity(entity, { model: strapi.models.pedido });
  },
};
