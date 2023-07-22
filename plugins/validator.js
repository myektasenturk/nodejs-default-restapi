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
      } else if (params[key] === null) {
        control = 0;
      } else {
        control = 1;
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

            case "array":
              if (!Array.isArray(params[key])) {
                setError(key, "array");
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
              if (rule.startsWith("in:")) {
                let allowedValues = rule.substring(3).split(",");
                if (!allowedValues.includes(params[key])) {
                  setError(key, `in:${allowedValues.join(",")}`);
                }
              } else if (rule.startsWith("exist:")) {
                if (rule.substring(6).split(",").length === 2 && params[key] !== undefined && params[key] !== null) {
                  let [table, field] = rule.substring(6).split(",");
                  let is = await knex(table).where(field, params[key]).first();

                  if (is === undefined) {
                    setError(key, `exist:${table},${field}`);
                  }
                } else {
                  setError(key, "exist: insufficient data");
                }
              } else if (rule.search('unique') >= 0 && params[key] !== undefined && params[key] !== null) {
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
                  setError(key, "unique: insufficient data");
                }
              } else if (rule.startsWith("min:")) {
                let minValue = parseInt(rule.split(":")[1]);
                if (typeof params[key] === "number" && params[key] < minValue) {
                  setError(key, `min:${minValue}`);
                } else if (typeof params[key] === "string" && params[key].length < minValue) {
                  setError(key, `minLength:${minValue}`);
                } else if (Array.isArray(params[key]) && params[key].length < minValue) {
                  setError(key, `minArrayLength:${minValue}`);
                }
              } else if (rule.startsWith("max:")) {
                let maxValue = parseInt(rule.split(":")[1]);
                if (typeof params[key] === "number" && params[key] > maxValue) {
                  setError(key, `max:${maxValue}`);
                } else if (typeof params[key] === "string" && params[key].length > maxValue) {
                  setError(key, `maxLength:${maxValue}`);
                } else if (Array.isArray(params[key]) && params[key].length > maxValue) {
                  setError(key, `maxArrayLength:${maxValue}`);
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
  if (!errorList.hasOwnProperty(key)) { errorList[key] = []; }

  errorList[key].push(err);
  
  if (!failStatus) { failStatus = true; }
};

module.exports = {
  all,
  fails,
  errors
};
