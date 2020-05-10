"use strict";
const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.pedido.search(ctx.query, [
        "platillos_de_pedidos.platillo",
      ]);
    } else {
      entities = await strapi.services.pedido.find(ctx.query, [
        "platillos_de_pedidos.platillo",
      ]);
    }
    entities = entities.map((entity) =>
      sanitizeEntity(entity, {
        model: strapi.models.pedido,
        withPrivate: false,
      })
    );
    entities.forEach((pedido) => {
      pedido.platillos = pedido.platillos_de_pedidos;
      pedido.platillos_de_pedidos = undefined;
      pedido.platillos.forEach((platillo) => {
        platillo.id = undefined;
        platillo.pedido = undefined;
        platillo.created_at = undefined;
        platillo.updated_at = undefined;
      });
      pedido.created_at = undefined;
      pedido.updated_at = undefined;
    });

    return entities;
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    console.log(id);
    let pedido = await strapi.services.pedido.findOne({ id }, [
      "platillos_de_pedidos.platillo",
    ]);
    pedido = sanitizeEntity(pedido, {
      model: strapi.models.pedido,
      withPrivate: false,
    });
    pedido.platillos = pedido.platillos_de_pedidos;
    pedido.platillos_de_pedidos = undefined;
    pedido.platillos.forEach((platillo) => {
      platillo.id = undefined;
      platillo.pedido = undefined;
      platillo.created_at = undefined;
      platillo.updated_at = undefined;
    });
    pedido.created_at = undefined;
    pedido.updated_at = undefined;
    return pedido;
  },

  /**
   * Crea un pedido.
   *
   * @return {Object}
   */

  async create(ctx) {
    let entity;

    ctx.request.body.user = ctx.state.user.id;
    if (ctx.request.body.platillos === undefined) {
      ctx.response.badRequest("Platillos is empty");
      return;
    }

    const platillos = ctx.request.body.platillos;

    if (typeof platillos !== "object") {
      ctx.response.badRequest("Platillos is empty");
      return;
    }

    const arrValidation = platillos.filter((platillo) => {
      if (!platillo.id) return true;
      if (!platillo.cantidad) return true;
      if (platillo.comentarios !== undefined) {
        if (typeof platillo.comentarios !== "string") return true;
      }
    });

    if (arrValidation.length > 0) {
      ctx.response.badRequest("Not valid");
      return;
    }

    entity = await strapi.services.pedido.create(ctx.request.body);

    const { id: pedido } = entity;
    let platillos_de_pedido = [];
    for (let i = 0; i < platillos.length; i++) {
      const platillo = platillos[i];
      const { id, comentarios, cantidad } = platillo;
      const platillo_de_pedido = await strapi.services[
        "platillos-de-pedido"
      ].create({
        pedido,
        platillo: id,
        comentarios,
        cantidad,
      });
      platillo_de_pedido.id = platillo_de_pedido.platillo.id;
      platillo_de_pedido.platillo = undefined;
      platillo_de_pedido.pedido = undefined;
      platillo_de_pedido.created_at = undefined;
      platillo_de_pedido.updated_at = undefined;
      platillos_de_pedido.push(platillo_de_pedido);
    }

    entity.user = undefined;
    entity.platillos_de_pedidos = undefined;
    entity.platillos = platillos_de_pedido;
    return entity;
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
