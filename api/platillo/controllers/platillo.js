"use strict";
const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  /**
   * Retrieve records.
   *
   * @return {Array}
   */

  async find(ctx) {
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.platillo.search(ctx.query, [
        "nombre",
        "imagen",
      ]);
    } else {
      entities = await strapi.services.platillo.find(ctx.query, [
        "nombre",
        "imagen",
      ]);
    }
    entities = entities.map((entity) =>
      sanitizeEntity(entity, {
        model: strapi.models.platillo,
        withPrivate: false,
      })
    );
    return entities;
  },

  /**
   * Retrieve a record.
   *
   * @return {Object}
   */

  async findOne(ctx) {
    const { id } = ctx.params;

    const entity = await strapi.services.platillo.findOne({ id }, [
      "nombre",
      "imagen",
    ]);
    return sanitizeEntity(entity, {
      model: strapi.models.platillo,
      withPrivate: false,
    });
  },
};
