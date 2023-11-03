const knex = require('knex')(require('../knexfile'));
const { validation } = require('./../lang/en/validation');

let hasError = false;
let errorList = {};

const all = async (params, rules) => {
  hasError = false;
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

      if (param === false || params[key] === null) {
        control = 0;
      } else {
        control = 1;
      }
    }

    if (control === 1) {
      if (rules[key].search('required') >= 0) {
        if (!params.hasOwnProperty(key) || params[key] === null) {
          setError(key, validation("required", key));
          control = 0;
        }
      }

      if (control === 1) {
        for (let rule of rulesArr) {
          if (rule !== "nullable") {
            switch (rule) {
              case "integer":
                let int = parseInt(params[key]);
                if (!Number.isInteger(int)) {
                  setError(key, validation("integer", key));
                }
                break;

              case "string":
                if (typeof params[key] !== "string") {
                  setError(key, validation("string", key));
                }
                break;

              case "array":
                if (!Array.isArray(params[key])) {
                  setError(key, validation("array", key));
                }
                break;

              case "boolean":
                if (typeof params[key] !== "boolean") {
                  setError(key, validation("boolean", key));
                }
                break;

              case "email":
                let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(params[key])) {
                  setError(key, validation("email", key));
                }
                break;

              default:
                if (rule.startsWith("in:")) {
                  let allowedValues = rule.substring(3).split(",");
                  if (!allowedValues.includes(params[key])) {
                    setError(key, validation("in", key));
                  }
                } else if (rule.startsWith("exists:")) {
                  if (rule.substring(6).split(",").length === 2 && params[key] !== undefined && params[key] !== null) {
                    let [table, field] = rule.substring(6).split(",");
                    let is = await knex(table).where(field, params[key]).first();

                    if (is === undefined) {
                      setError(key, validation("exists", key));
                    }
                  } else {
                    setError(key, validation("exists", key));
                  }
                } else if (rule.search('unique') >= 0 && params[key] !== undefined && params[key] !== null) {
                  let uniqueArr = rule.split(":")[1].split(",");

                  if (uniqueArr.length === 4) {
                    let is = await knex(uniqueArr[0]).where(uniqueArr[1], params[key]).whereNot(uniqueArr[3], uniqueArr[2]).first();

                    if (is !== undefined) {
                      setError(key, validation("unique", key));
                    }
                  } else if (uniqueArr.length >= 2) {
                    let is = await knex(uniqueArr[0]).where(uniqueArr[1], params[key]).first();

                    if (is !== undefined) {
                      setError(key, validation("unique", key));
                    }
                  } else {
                    setError(key, validation("unique", key));
                  }
                } else if (rule.startsWith("min:")) {
                  let minValue = parseInt(rule.split(":")[1]);
                  if (typeof params[key] === "number" && params[key] < minValue) {
                    setError(key, validation("min.numeric", key, minValue));
                  } else if (typeof params[key] === "string" && params[key].length < minValue) {
                    setError(key, validation("min.string", key, minValue));
                  } else if (Array.isArray(params[key]) && params[key].length < minValue) {
                    setError(key, validation("min.array", key, minValue));
                  }
                } else if (rule.startsWith("max:")) {
                  let maxValue = parseInt(rule.split(":")[1]);
                  if (typeof params[key] === "number" && params[key] > maxValue) {
                    setError(key, validation("max.numeric", key, maxValue));
                  } else if (typeof params[key] === "string" && params[key].length > maxValue) {
                    setError(key, validation("max.string", key, maxValue));
                  } else if (Array.isArray(params[key]) && params[key].length > maxValue) {
                    setError(key, validation("max.array", key, maxValue));
                  }
                }
                break;
            }
          }
        }
      }
    }
  }
};

const fails = () => hasError;
const errors = () => errorList;

const setError = (key, err) => {
  if (!errorList.hasOwnProperty(key)) { errorList[key] = []; }

  errorList[key].push(err);

  if (!hasError) { hasError = true; }
};

module.exports = {
  all,
  fails,
  errors
};