const { Op } = require("sequelize");

class ApiFeatures {
  constructor(model, queryString) {
    this.model = model;
    //this.query = model.findAll();
    this.queryString = queryString;
  }

  filter() {
    let queryObj = {
      ...this.queryString,
    };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);
    function revers(string) {
      return [...string].reverse().join("");
    }
    let queryStr = JSON.stringify(queryObj);
    //console.log(queryStr);
    const re = /\b(gte|gt|lte|lt)\b/g;
    var match,
      indexes = [];
    while ((match = re.exec(queryStr))) indexes.push([match.index, match[0]]);
    //console.log(indexes);
    indexes.map((x) => {
      let ne = revers(queryStr).slice(
        queryStr.length - (x[0] - 4),
        queryStr.length
      );
      let val = queryStr.slice(x[0], queryStr.length).split('"')[2];
      //ne = revers(ne.split('"')[0]);
      let fin = {};
      if (x[1] == "lt") {
        fin = {
          [revers(ne.split('"')[0])]: { [Op.lt]: val },
        };
      }
      if (x[1] == "lte") {
        fin = {
          [revers(ne.split('"')[0])]: { [Op.lte]: val },
        };
      }
      if (x[1] == "gt") {
        fin = {
          [revers(ne.split('"')[0])]: { [Op.gt]: val },
        };
      }
      if (x[1] == "gte") {
        fin = {
          [revers(ne.split('"')[0])]: { [Op.gte]: val },
        };
      }
      queryObj = { ...queryObj, ...fin };
    });
    //console.log(queryObj);
    let final = { where: {} };
    final.where = queryObj;
    //console.log(final);
    this.final = final;

    return this;
  }

  sort() {
    //console.log(this.final);
    let z = [];
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",");
      //console.log(sortBy);
      sortBy.map((x) => {
        if (x.charAt(0) === "-") {
          z.push([x.slice(1, x.length), "DESC"]);
        } else {
          z.push([x]);
        }
        this.final.order = z;
        //console.log(this.final);
      });
    } else {
      this.final.order = [["createdAt", "DESC"]];
    }
    return this;
  }

  limitFields() {
    // attributes: ['foo', ['bar', 'baz'], 'qux']
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",");
      //console.log(fields);
      this.final.attributes = fields;
    }

    return this;
  }

  paginate() {
    //{ offset: 5, limit: 5 }
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.final.offset = skip;
    this.final.limit = limit;
    //this.query = this.model.findAll(this.final);
    return this;
  }
}

module.exports = ApiFeatures;
