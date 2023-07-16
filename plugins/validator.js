const knex = require('knex')(require('../knexfile'));

let failStatus = false;
let errorList = {};

const all = async (params, rules) => {
  failStatus = false;
  errorList = {};

  let keys = Object.keys(rules);
  let control = 1;

  for (let key of keys) {
    control = 1;

    let rulesArr = rules[key].split("|");
    let nullable = rulesArr.findIndex((rule) => rule === "nullable");

    if (nullable < 0) {
      control = 1;
    } else {
      let param = params.hasOwnProperty(key);

      if (param === false) {
        control = 0;
      } else {
        if (params[key] === null) {
          control = 0;
        } else {
          control = 1;
        }
      }
    }

    if (control === 1) {
      for (let rule of rulesArr) {
        if (rule !== "nullable") {
          switch (rule) {
            case "required":
              if (!params.hasOwnProperty(key) || params[key] === null) {
                setError(key, "required");
              }
              break;

            case "integer":
              let int = parseInt(params[key]);
              if (!Number.isInteger(int)) {
                setError(key, "integer");
              }
              break;

            case "string":
              if (typeof params[key] !== "string") {
                setError(key, "string");
              }
              break;

            case "boolean":
              if (typeof params[key] !== "boolean") {
                setError(key, "boolean");
              }
              break;

            case "email":
              let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailPattern.test(params[key])) {
                setError(key, "email");
              }
              break;

            default:
              if (rule.search('unique') >= 0 && params[key] !== undefined && params[key] !== null) {
                let uniqueArr = rule.split(":")[1].split(",");

                if (uniqueArr.length === 4) {
                  let is = await knex(uniqueArr[0]).where(uniqueArr[1], params[key]).whereNot(uniqueArr[3], uniqueArr[2]).first();

                  if (is !== undefined) {
                    setError(key, "unique");
                  }
                } else if (uniqueArr.length >= 2) {
                  let is = await knex(uniqueArr[0]).where(uniqueArr[1], params[key]).first();

                  if (is !== undefined) {
                    setError(key, "unique");
                  }
                } else {
                  setError(key, "unique");
                }
              }
              break;
          }
        }
      }
    }
  }
};

const fails = () => failStatus;
const errors = () => errorList;

const setError = (key, err) => {
  if (!errorList.hasOwnProperty(key)) {
    errorList[key] = [];
  }

  errorList[key].push(err);

  failStatus = true;
};

const validator = {
  all,
  fails,
  errors,
};

module.exports = validator;
