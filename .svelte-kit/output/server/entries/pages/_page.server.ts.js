import "clsx";
import "../../chunks/client.js";
import { merge as merge$1 } from "ts-deepmerge";
import { fail, redirect } from "@sveltejs/kit";
import { parse } from "devalue";
import baseMemoize from "memoize-weak";
import Type from "typebox";
import "zod-v3-to-json-schema";
import { toJSONSchema, config, safeParseAsync } from "zod/v4/core";
import { a as auth } from "../../chunks/auth.js";
import { z } from "zod";
function setPath(parent, key, value) {
  if (key === "__proto__" || key === "prototype") {
    throw new Error("Cannot set an object's `__proto__` or `prototype` property");
  }
  parent[key] = value;
  return "skip";
}
function isInvalidPath(originalPath, pathData) {
  return pathData.value !== void 0 && typeof pathData.value !== "object" && pathData.path.length < originalPath.length;
}
function pathExists(obj, path, options = {}) {
  if (!options.modifier) {
    options.modifier = (pathData) => isInvalidPath(path, pathData) ? void 0 : pathData.value;
  }
  const exists = traversePath(obj, path, options.modifier);
  if (!exists)
    return void 0;
  if (options.value === void 0)
    return exists;
  return options.value(exists.value) ? exists : void 0;
}
function traversePath(obj, realPath, modifier) {
  if (!realPath.length)
    return void 0;
  if (realPath.includes("__proto__") || realPath.includes("prototype")) {
    throw new Error("Cannot set an object's `__proto__` or `prototype` property");
  }
  const path = [realPath[0]];
  let parent = obj;
  while (parent && path.length < realPath.length) {
    const key2 = path[path.length - 1];
    const value = modifier ? modifier({
      parent,
      key: String(key2),
      value: parent[key2],
      path: path.map((p) => String(p)),
      isLeaf: false,
      set: (v) => setPath(parent, key2, v)
    }) : parent[key2];
    if (value === void 0)
      return void 0;
    else
      parent = value;
    path.push(realPath[path.length]);
  }
  if (!parent)
    return void 0;
  const key = realPath[realPath.length - 1];
  return {
    parent,
    key: String(key),
    value: parent[key],
    path: realPath.map((p) => String(p)),
    isLeaf: true,
    set: (v) => setPath(parent, key, v)
  };
}
function traversePaths(parent, modifier, path = []) {
  for (const key in parent) {
    const value = parent[key];
    const isLeaf = value === null || typeof value !== "object";
    const pathData = {
      parent,
      key,
      value,
      path: path.concat([key]),
      // path.map(String).concat([key])
      isLeaf,
      set: (v) => setPath(parent, key, v)
    };
    const status = modifier(pathData);
    if (status === "abort")
      return status;
    else if (status === "skip")
      continue;
    else if (!isLeaf) {
      const status2 = traversePaths(value, modifier, pathData.path);
      if (status2 === "abort")
        return status2;
    }
  }
}
function setPaths(obj, paths, value) {
  const isFunction = typeof value === "function";
  for (const path of paths) {
    const leaf = traversePath(obj, path, ({ parent, key, value: value2 }) => {
      if (value2 === void 0 || typeof value2 !== "object") {
        parent[key] = {};
      }
      return parent[key];
    });
    if (leaf) {
      if (leaf.key === "__proto__" || leaf.key === "prototype") {
        throw new Error("Cannot set an object's `__proto__` or `prototype` property");
      }
      leaf.parent[leaf.key] = isFunction ? value(path, leaf) : value;
    }
  }
}
function splitPath(path) {
  return path.toString().split(/[[\].]+/).filter((p) => p);
}
function clone$1(obj) {
  const type = {}.toString.call(obj).slice(8, -1);
  if (type == "Set") {
    return new Set([...obj].map((value) => clone$1(value)));
  }
  if (type == "Map") {
    return new Map([...obj].map((kv) => [clone$1(kv[0]), clone$1(kv[1])]));
  }
  if (type == "Date") {
    return new Date(obj.getTime());
  }
  if (type == "RegExp") {
    return RegExp(obj.source, obj.flags);
  }
  if (type == "Array" || type == "Object") {
    const result = type == "Object" ? Object.create(Object.getPrototypeOf(obj)) : [];
    for (const key in obj) {
      result[key] = clone$1(obj[key]);
    }
    return result;
  }
  return obj;
}
function clone(data) {
  return data && typeof data === "object" ? clone$1(data) : data;
}
function assertSchema(schema, path) {
  if (typeof schema === "boolean") {
    throw new SchemaError("Schema property cannot be defined as boolean.", path);
  }
}
const conversionFormatTypes = [
  "unix-time",
  "bigint",
  "any",
  "symbol",
  "set",
  "map",
  "int64",
  "stringbool"
];
function schemaInfo(schema, isOptional, path) {
  assertSchema(schema, path);
  const types = schemaTypes(schema, path);
  const array = schema.items && types.includes("array") ? (Array.isArray(schema.items) ? schema.items : [schema.items]).filter((s) => typeof s !== "boolean") : void 0;
  const additionalProperties = schema.additionalProperties && typeof schema.additionalProperties === "object" && types.includes("object") ? Object.fromEntries(Object.entries(schema.additionalProperties).filter(([, value]) => typeof value !== "boolean")) : void 0;
  const properties = schema.properties && types.includes("object") ? Object.fromEntries(Object.entries(schema.properties).filter(([, value]) => typeof value !== "boolean")) : void 0;
  const union = unionInfo(schema)?.filter((u) => u.type !== "null" && u.const !== null);
  const result = {
    types: types.filter((s) => s !== "null"),
    isOptional,
    isNullable: types.includes("null"),
    schema,
    union: union?.length ? union : void 0,
    array,
    properties,
    additionalProperties,
    required: schema.required
  };
  if (!schema.allOf || !schema.allOf.length) {
    return result;
  }
  return {
    ...merge$1.withOptions({ allowUndefinedOverrides: false }, result, ...schema.allOf.map((s) => schemaInfo(s, false, []))),
    schema
  };
}
function schemaTypes(schema, path) {
  assertSchema(schema, path);
  let types = schema.const === null ? ["null"] : [];
  if (schema.type) {
    types = Array.isArray(schema.type) ? schema.type : [schema.type];
  }
  if (schema.anyOf) {
    types = schema.anyOf.flatMap((s) => schemaTypes(s, path));
  }
  if (schema.oneOf) {
    types = schema.oneOf.flatMap((s) => schemaTypes(s, path));
  }
  if (types.includes("array") && schema.uniqueItems) {
    const i = types.findIndex((t) => t === "array");
    if (i !== -1)
      types[i] = "set";
  } else if (schema.format && conversionFormatTypes.includes(schema.format)) {
    types.unshift(schema.format);
    if (schema.format == "unix-time" || schema.format == "int64") {
      const i = types.findIndex((t) => t == "integer");
      types.splice(i, 1);
    }
    if (schema.format == "bigint") {
      const i = types.findIndex((t) => t == "string");
      types.splice(i, 1);
    }
    if (schema.format == "stringbool") {
      const i = types.findIndex((t) => t == "string");
      if (i !== -1)
        types.splice(i, 1);
    }
  }
  if (schema.const && schema.const !== null && typeof schema.const !== "function") {
    types.push(typeof schema.const);
  }
  return Array.from(new Set(types));
}
function unionInfo(schema) {
  if (!schema.oneOf && !schema.anyOf)
    return void 0;
  if (schema.oneOf && schema.oneOf.length) {
    return schema.oneOf.filter((s) => typeof s !== "boolean");
  }
  if (schema.anyOf && schema.anyOf.length) {
    return schema.anyOf.filter((s) => typeof s !== "boolean");
  }
  return void 0;
}
function defaultValues(schema, isOptional = false, path = []) {
  return _defaultValues(schema, isOptional, path);
}
function _defaultValues(schema, isOptional, path) {
  if (!schema) {
    throw new SchemaError("Schema was undefined", path);
  }
  const info = schemaInfo(schema, isOptional, path);
  if (!info)
    return void 0;
  let objectDefaults = void 0;
  if ("default" in schema) {
    if (info.types.includes("object") && schema.default && typeof schema.default == "object" && !Array.isArray(schema.default)) {
      objectDefaults = schema.default;
    } else {
      if (info.types.length > 1) {
        if (info.types.includes("unix-time") && (info.types.includes("integer") || info.types.includes("number")))
          throw new SchemaError("Cannot resolve a default value with a union that includes a date and a number/integer.", path);
      }
      const [type] = info.types;
      return formatDefaultValue(type, schema.default);
    }
  }
  let _multiType;
  const isMultiTypeUnion = () => {
    if (!info.union || info.union.length < 2)
      return false;
    if (info.union.some((i) => i.enum))
      return true;
    if (!_multiType) {
      _multiType = new Set(info.types.map((i) => {
        return ["integer", "unix-time"].includes(i) ? "number" : i;
      }));
    }
    return _multiType.size > 1;
  };
  let output = void 0;
  if (!objectDefaults && info.union) {
    const singleDefault = info.union.filter((s) => typeof s !== "boolean" && s.default !== void 0);
    if (singleDefault.length == 1) {
      return _defaultValues(singleDefault[0], isOptional, path);
    } else if (singleDefault.length > 1) {
      throw new SchemaError("Only one default value can exist in a union, or set a default value for the whole union.", path);
    } else {
      if (info.isNullable)
        return null;
      if (info.isOptional)
        return void 0;
      if (isMultiTypeUnion()) {
        throw new SchemaError("Multi-type unions must have a default value, or exactly one of the union types must have.", path);
      }
      if (info.union.length) {
        if (info.types[0] == "object") {
          if (output === void 0)
            output = {};
          output = info.union.length > 1 ? merge$1.withOptions({ allowUndefinedOverrides: true }, ...info.union.map((s) => _defaultValues(s, isOptional, path))) : _defaultValues(info.union[0], isOptional, path);
        } else {
          return _defaultValues(info.union[0], isOptional, path);
        }
      }
    }
  }
  if (!objectDefaults) {
    if (info.isNullable)
      return null;
    if (info.isOptional)
      return void 0;
  }
  if (info.properties) {
    for (const [key, objSchema] of Object.entries(info.properties)) {
      assertSchema(objSchema, [...path, key]);
      let def;
      if (objectDefaults && objectDefaults[key] !== void 0) {
        try {
          const propInfo = schemaInfo(objSchema, !info.required?.includes(key), [...path, key]);
          if (propInfo) {
            const propType = propInfo.types[0];
            if (propType === "object" && typeof objectDefaults[key] === "object" && objectDefaults[key] !== null && !Array.isArray(objectDefaults[key])) {
              const schemaWithDefault = {
                ...objSchema,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                default: objectDefaults[key]
              };
              def = _defaultValues(schemaWithDefault, !info.required?.includes(key), [
                ...path,
                key
              ]);
            } else {
              def = formatDefaultValue(propType, objectDefaults[key]);
            }
          } else {
            def = objectDefaults[key];
          }
        } catch {
          def = objectDefaults[key];
        }
      } else {
        def = _defaultValues(objSchema, !info.required?.includes(key), [...path, key]);
      }
      if (output === void 0)
        output = {};
      output[key] = def;
    }
  } else if (objectDefaults) {
    return objectDefaults;
  }
  if (schema.enum) {
    return schema.enum[0];
  }
  if ("const" in schema) {
    return schema.const;
  }
  if (isMultiTypeUnion()) {
    throw new SchemaError("Default values cannot have more than one type.", path);
  } else if (info.types.length == 0) {
    return void 0;
  }
  const [formatType] = info.types;
  return output ?? defaultValue(formatType, schema.enum);
}
function formatDefaultValue(type, value) {
  switch (type) {
    case "set":
      return Array.isArray(value) ? new Set(value) : value;
    case "map":
      return Array.isArray(value) ? new Map(value) : value;
    case "Date":
    case "date":
    case "unix-time":
      if (typeof value === "string" || typeof value === "number")
        return new Date(value);
      break;
    case "bigint":
      if (typeof value === "string" || typeof value === "number")
        return BigInt(value);
      break;
    case "symbol":
      if (typeof value === "string" || typeof value === "number")
        return Symbol(value);
      break;
  }
  return value;
}
function defaultValue(type, enumType) {
  switch (type) {
    case "string":
      return enumType && enumType.length > 0 ? enumType[0] : "";
    case "number":
    case "integer":
      return enumType && enumType.length > 0 ? enumType[0] : 0;
    case "boolean":
      return false;
    case "array":
      return [];
    case "object":
      return {};
    case "null":
      return null;
    case "Date":
    case "date":
    case "unix-time":
      return void 0;
    case "int64":
    case "bigint":
      return BigInt(0);
    case "stringbool":
      return "";
    case "set":
      return /* @__PURE__ */ new Set();
    case "map":
      return /* @__PURE__ */ new Map();
    case "symbol":
      return Symbol();
    case "undefined":
    case "any":
      return void 0;
    default:
      throw new SchemaError("Schema type or format not supported, requires explicit default value: " + type);
  }
}
function defaultTypes(schema, path = []) {
  return _defaultTypes(schema, false, path);
}
function _defaultTypes(schema, isOptional, path) {
  if (!schema) {
    throw new SchemaError("Schema was undefined", path);
  }
  const info = schemaInfo(schema, isOptional, path);
  let output = {
    __types: info.types
  };
  if (info.union) {
    output = merge$1(output, ...info.union.map((u) => _defaultTypes(u, info.isOptional, path)));
  }
  if (info.schema.items && typeof info.schema.items == "object" && !Array.isArray(info.schema.items)) {
    output.__items = _defaultTypes(info.schema.items, info.isOptional, path);
  }
  if (info.properties) {
    for (const [key, value] of Object.entries(info.properties)) {
      assertSchema(value, [...path, key]);
      output[key] = _defaultTypes(info.properties[key], !info.required?.includes(key), [
        ...path,
        key
      ]);
    }
  }
  if (info.additionalProperties && info.types.includes("object")) {
    const additionalInfo = schemaInfo(info.additionalProperties, info.isOptional, path);
    if (additionalInfo.properties && additionalInfo.types.includes("object")) {
      for (const [key] of Object.entries(additionalInfo.properties)) {
        output[key] = _defaultTypes(additionalInfo.properties[key], !additionalInfo.required?.includes(key), [...path, key]);
      }
    }
  }
  if (info.isNullable && !output.__types.includes("null")) {
    output.__types.push("null");
  }
  if (info.isOptional && !output.__types.includes("undefined")) {
    output.__types.push("undefined");
  }
  return output;
}
class SuperFormError extends Error {
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, SuperFormError.prototype);
  }
}
class SchemaError extends SuperFormError {
  path;
  constructor(message, path) {
    super((path && path.length ? `[${Array.isArray(path) ? path.join(".") : path}] ` : "") + message);
    this.path = Array.isArray(path) ? path.join(".") : path;
    Object.setPrototypeOf(this, SchemaError.prototype);
  }
}
function mapErrors(errors, shape) {
  const output = {};
  function addFormLevelError(error) {
    if (!("_errors" in output))
      output._errors = [];
    if (!Array.isArray(output._errors)) {
      if (typeof output._errors === "string")
        output._errors = [output._errors];
      else
        throw new SuperFormError("Form-level error was not an array.");
    }
    output._errors.push(error.message);
  }
  for (const error of errors) {
    if (!error.path || error.path.length == 1 && !error.path[0]) {
      addFormLevelError(error);
      continue;
    }
    const isLastIndexNumeric = /^\d$/.test(String(error.path[error.path.length - 1]));
    const objectError = !isLastIndexNumeric && pathExists(shape, error.path.filter((p) => /\D/.test(String(p))))?.value;
    const leaf = traversePath(output, error.path, ({ value, parent: parent2, key: key2 }) => {
      if (value === void 0)
        parent2[key2] = {};
      return parent2[key2];
    });
    if (!leaf) {
      addFormLevelError(error);
      continue;
    }
    const { parent, key } = leaf;
    if (objectError) {
      if (!(key in parent))
        parent[key] = {};
      if (!("_errors" in parent[key]))
        parent[key]._errors = [error.message];
      else
        parent[key]._errors.push(error.message);
    } else {
      if (!(key in parent))
        parent[key] = [error.message];
      else
        parent[key].push(error.message);
    }
  }
  return output;
}
function mergeDefaults(parsedData, defaults) {
  if (!parsedData)
    return clone(defaults);
  return merge$1.withOptions({ mergeArrays: false }, defaults, parsedData);
}
function replaceInvalidDefaults(Data, Defaults, _schema, Errors, preprocessed) {
  const defaultType = _schema.additionalProperties && typeof _schema.additionalProperties == "object" ? { __types: schemaInfo(_schema.additionalProperties, false, []).types } : void 0;
  const Types = defaultTypes(_schema);
  function Types_correctValue(dataValue, defValue, type) {
    const types = type.__types;
    if (!types.length || types.every((t) => t == "undefined" || t == "null" || t == "any")) {
      return dataValue;
    } else if (types.length == 1 && types[0] == "array" && !type.__items) {
      return dataValue;
    }
    const dateTypes = ["unix-time", "Date", "date"];
    for (const schemaType of types) {
      const defaultTypeValue = defaultValue(schemaType, void 0);
      const sameType = typeof dataValue === typeof defaultTypeValue || dateTypes.includes(schemaType) && dataValue instanceof Date;
      const sameExistance = sameType && dataValue === null === (defaultTypeValue === null);
      if (sameType && sameExistance) {
        return dataValue;
      } else if (type.__items) {
        return Types_correctValue(dataValue, defValue, type.__items);
      }
    }
    if (defValue === void 0 && types.includes("null")) {
      return null;
    }
    return defValue;
  }
  function Data_traverse() {
    traversePaths(Defaults, Defaults_traverseAndReplace);
    Errors_traverseAndReplace();
    return Data;
  }
  function Data_setValue(currentPath, newValue) {
    setPaths(Data, [currentPath], newValue);
  }
  function Errors_traverseAndReplace() {
    for (const error of Errors) {
      if (!error.path)
        continue;
      Defaults_traverseAndReplace({
        path: error.path,
        value: pathExists(Defaults, error.path)?.value
      }, true);
    }
  }
  function Defaults_traverseAndReplace(defaultPath, traversingErrors = false) {
    const currentPath = defaultPath.path;
    if (!currentPath || !currentPath[0])
      return;
    if (typeof currentPath[0] === "string" && preprocessed?.includes(currentPath[0]))
      return;
    const dataPath = pathExists(Data, currentPath);
    if (!dataPath && defaultPath.value !== void 0 || dataPath && dataPath.value === void 0) {
      Data_setValue(currentPath, defaultPath.value);
    } else if (dataPath) {
      const defValue = defaultPath.value;
      const dataValue = dataPath.value;
      if (defValue !== void 0 && typeof dataValue === typeof defValue && dataValue === null === (defValue === null)) {
        return;
      }
      const typePath = currentPath.filter((p) => /\D/.test(String(p)));
      const pathTypes = traversePath(Types, typePath, (path) => {
        return path.value && "__items" in path.value ? path.value.__items : path.value;
      });
      if (!pathTypes) {
        if (traversingErrors)
          return;
        throw new SchemaError("No types found for defaults", currentPath);
      }
      const fieldType = pathTypes.value ?? defaultType;
      if (fieldType) {
        const corrected = Types_correctValue(dataValue, defValue, fieldType);
        if (corrected === dataValue)
          return "skip";
        Data_setValue(currentPath, corrected);
      }
    }
  }
  {
    return Data_traverse();
  }
}
var FetchStatus;
(function(FetchStatus2) {
  FetchStatus2[FetchStatus2["Idle"] = 0] = "Idle";
  FetchStatus2[FetchStatus2["Submitting"] = 1] = "Submitting";
  FetchStatus2[FetchStatus2["Delayed"] = 2] = "Delayed";
  FetchStatus2[FetchStatus2["Timeout"] = 3] = "Timeout";
})(FetchStatus || (FetchStatus = {}));
function schemaShape(schema, path = []) {
  const output = _schemaShape(schema, path);
  if (!output) {
    throw new SchemaError('No shape could be created for schema. If using Zod v4, import { zod4 } from "sveltekit-superforms/adapters" instead of { zod }.', path);
  }
  return output;
}
function _schemaShape(schema, path) {
  assertSchema(schema, path);
  const info = schemaInfo(schema, false, path);
  if (info.array || info.union) {
    const arr = info.array || [];
    const union = info.union || [];
    return arr.concat(union).reduce((shape, next) => {
      const nextShape = _schemaShape(next, path);
      if (nextShape)
        shape = { ...shape ?? {}, ...nextShape };
      return shape;
    }, arr.length ? {} : void 0);
  }
  if (info.properties) {
    const output = {};
    for (const [key, prop] of Object.entries(info.properties)) {
      const shape = _schemaShape(prop, [...path, key]);
      if (shape)
        output[key] = shape;
    }
    return output;
  }
  return info.types.includes("array") || info.types.includes("object") ? {} : void 0;
}
let LEGACY_MODE = false;
try {
  if (SUPERFORMS_LEGACY)
    LEGACY_MODE = true;
} catch {
}
let STORYBOOK_MODE = false;
try {
  if (globalThis.STORIES)
    STORYBOOK_MODE = true;
} catch {
}
function constraints(schema) {
  return _constraints(schemaInfo(schema, false, []), []);
}
function merge(...constraints2) {
  const filtered = constraints2.filter((c) => !!c);
  if (!filtered.length)
    return void 0;
  if (filtered.length == 1)
    return filtered[0];
  return merge$1(...filtered);
}
function _constraints(info, path) {
  if (!info)
    return void 0;
  let output = void 0;
  if (info.union && info.union.length) {
    const infos = info.union.map((s) => schemaInfo(s, info.isOptional, path));
    const merged = infos.map((i) => _constraints(i, path));
    output = merge(output, ...merged);
    if (output && (info.isNullable || info.isOptional || infos.some((i) => i?.isNullable || i?.isOptional))) {
      delete output.required;
    }
  }
  if (info.array) {
    output = merge(output, ...info.array.map((i) => _constraints(schemaInfo(i, info.isOptional, path), path)));
  }
  if (info.properties) {
    const obj = {};
    for (const [key, prop] of Object.entries(info.properties)) {
      const propInfo = schemaInfo(prop, !info.required?.includes(key) || prop.default !== void 0, [key]);
      const propConstraint = _constraints(propInfo, [...path, key]);
      if (typeof propConstraint === "object" && Object.values(propConstraint).length > 0) {
        obj[key] = propConstraint;
      }
    }
    output = merge(output, obj);
  }
  return output ?? constraint(info);
}
function constraint(info) {
  const output = {};
  const schema = info.schema;
  const type = schema.type;
  const format = schema.format;
  if (type == "integer" && format == "unix-time") {
    const date = schema;
    if (date.minimum !== void 0)
      output.min = new Date(date.minimum).toISOString();
    if (date.maximum !== void 0)
      output.max = new Date(date.maximum).toISOString();
  } else if (type == "string") {
    const str = schema;
    const patterns = [
      str.pattern,
      ...str.allOf ? str.allOf.map((s) => typeof s == "boolean" ? void 0 : s.pattern) : []
    ].filter((s) => s !== void 0);
    if (patterns.length > 0)
      output.pattern = patterns[0];
    if (str.minLength !== void 0)
      output.minlength = str.minLength;
    if (str.maxLength !== void 0)
      output.maxlength = str.maxLength;
  } else if (type == "number" || type == "integer") {
    const num = schema;
    if (num.minimum !== void 0)
      output.min = num.minimum;
    else if (num.exclusiveMinimum !== void 0)
      output.min = num.exclusiveMinimum + (type == "integer" ? 1 : Number.MIN_VALUE);
    if (num.maximum !== void 0)
      output.max = num.maximum;
    else if (num.exclusiveMaximum !== void 0)
      output.max = num.exclusiveMaximum - (type == "integer" ? 1 : Number.MIN_VALUE);
    if (num.multipleOf !== void 0)
      output.step = num.multipleOf;
  } else if (type == "array") {
    const arr = schema;
    if (arr.minItems !== void 0)
      output.min = arr.minItems;
    if (arr.maxItems !== void 0)
      output.max = arr.maxItems;
  }
  if (!info.isNullable && !info.isOptional) {
    output.required = true;
  }
  return Object.keys(output).length > 0 ? output : void 0;
}
function schemaHash(schema) {
  return hashCode(_schemaHash(schemaInfo(schema, false, []), 0, []));
}
function _schemaHash(info, depth, path) {
  if (!info)
    return "";
  function tab() {
    return "  ".repeat(depth);
  }
  function mapSchemas(schemas) {
    return schemas.map((s) => _schemaHash(schemaInfo(s, info?.isOptional ?? false, path), depth + 1, path)).filter((s) => s).join("|");
  }
  function nullish() {
    const output = [];
    if (info?.isNullable)
      output.push("null");
    if (info?.isOptional)
      output.push("undefined");
    return !output.length ? "" : "|" + output.join("|");
  }
  if (info.union) {
    return "Union {\n  " + tab() + mapSchemas(info.union) + "\n" + tab() + "}" + nullish();
  }
  if (info.properties) {
    const output = [];
    for (const [key, prop] of Object.entries(info.properties)) {
      const propInfo = schemaInfo(prop, !info.required?.includes(key) || prop.default !== void 0, [key]);
      output.push(key + ": " + _schemaHash(propInfo, depth + 1, path));
    }
    return "Object {\n  " + tab() + output.join(",\n  ") + "\n" + tab() + "}" + nullish();
  }
  if (info.array) {
    return "Array[" + mapSchemas(info.array) + "]" + nullish();
  }
  return info.types.join("|") + nullish();
}
function hashCode(str) {
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  if (hash < 0)
    hash = hash >>> 0;
  return hash.toString(36);
}
// @__NO_SIDE_EFFECTS__
function createAdapter(adapter, jsonSchema) {
  if (!adapter || !("superFormValidationLibrary" in adapter)) {
    throw new SuperFormError('Superforms v2 requires a validation adapter for the schema. Import one of your choice from "sveltekit-superforms/adapters" and wrap the schema with it.');
  }
  if (!jsonSchema)
    jsonSchema = adapter.jsonSchema;
  return {
    ...adapter,
    constraints: adapter.constraints ?? constraints(jsonSchema),
    defaults: adapter.defaults ?? defaultValues(jsonSchema),
    shape: schemaShape(jsonSchema),
    id: schemaHash(jsonSchema)
  };
}
let legacyMode = false;
try {
  if (SUPERFORMS_LEGACY)
    legacyMode = true;
} catch {
}
const unionError = 'FormData parsing failed: Unions are only supported when the dataType option for superForm is set to "json".';
function isCompatibleTypeUnion(types) {
  const primaryTypes = new Set(types.map((type) => {
    if (["number", "integer"].includes(type))
      return "number";
    if (type === "unix-time")
      return "number";
    return type;
  }));
  return primaryTypes.size <= 1;
}
function isCompatibleUnionSchema(union) {
  if (!union)
    return true;
  const unionTypes = new Set(union.flatMap((u) => u.type ? Array.isArray(u.type) ? u.type : [u.type] : u.const !== void 0 ? [typeof u.const] : []));
  return unionTypes.size <= 1 || unionTypes.size === 2 && unionTypes.has("null");
}
async function parseRequest(data, schemaData, options) {
  let parsed;
  if (data instanceof FormData) {
    parsed = parseFormData(data, schemaData, options);
  } else if (data instanceof URL || data instanceof URLSearchParams) {
    parsed = parseSearchParams(data, schemaData, options);
  } else if (data instanceof Request) {
    parsed = await tryParseFormData(data, schemaData, options);
  } else if (
    // RequestEvent
    data && typeof data === "object" && "request" in data && data.request instanceof Request
  ) {
    parsed = await tryParseFormData(data.request, schemaData, options);
  } else {
    parsed = {
      id: void 0,
      data,
      posted: false
    };
  }
  return parsed;
}
async function tryParseFormData(request, schemaData, options) {
  let formData = void 0;
  try {
    formData = await request.formData();
  } catch (e) {
    if (e instanceof TypeError && e.message.includes("already been consumed")) {
      throw e;
    }
    return { id: void 0, data: void 0, posted: false };
  }
  return parseFormData(formData, schemaData, options);
}
function parseSearchParams(data, schemaData, options) {
  if (data instanceof URL)
    data = data.searchParams;
  const convert = new FormData();
  for (const [key, value] of data.entries()) {
    convert.append(key, value);
  }
  const output = parseFormData(convert, schemaData, options, true);
  output.posted = false;
  return output;
}
function parseFormData(formData, schemaData, options, fromURL = false) {
  function tryParseSuperJson() {
    if (formData.has("__superform_json")) {
      try {
        const transport = options && options.transport ? Object.fromEntries(Object.entries(options.transport).map(([k, v]) => [k, v.decode])) : void 0;
        const output = parse(formData.getAll("__superform_json").join("") ?? "", transport);
        if (typeof output === "object") {
          const filePaths = Array.from(formData.keys());
          for (const path of filePaths.filter((path2) => path2.startsWith("__superform_file_"))) {
            const realPath = splitPath(path.substring(17));
            setPaths(output, [realPath], formData.get(path));
          }
          for (const path of filePaths.filter((path2) => path2.startsWith("__superform_files_"))) {
            const realPath = splitPath(path.substring(18));
            const allFiles = formData.getAll(path);
            setPaths(output, [realPath], Array.from(allFiles));
          }
          return output;
        }
      } catch {
      }
    }
    return null;
  }
  const data = tryParseSuperJson();
  const id = formData.get("__superform_id")?.toString();
  return data ? { id, data, posted: true } : {
    id,
    data: _parseFormData(formData, schemaData, options, fromURL),
    posted: true
  };
}
function _parseFormData(formData, schema, options, fromURL = false) {
  const output = {};
  let schemaKeys;
  let discriminatedUnionSchema;
  if (options?.strict) {
    schemaKeys = new Set([...formData.keys()].filter((key) => !key.startsWith("__superform_")));
  } else {
    let unionKeys = [];
    if (schema.anyOf || schema.oneOf) {
      const info = schemaInfo(schema, false, []);
      if (info.union?.some((s) => s.type !== "object")) {
        throw new SchemaError("All form types must be an object if schema is a union.");
      }
      unionKeys = info.union?.flatMap((s) => Object.keys(s.properties ?? {})) ?? [];
      if (info.union && info.union.length > 1) {
        for (const variant of info.union) {
          const variantProps = variant.properties ?? {};
          const variantPropKeys = Object.keys(variantProps);
          let isMatch = true;
          for (const propKey of variantPropKeys) {
            const prop = variantProps[propKey];
            if (typeof prop !== "boolean" && prop?.const !== void 0) {
              const formValue = formData.get(propKey);
              if (formValue !== String(prop.const)) {
                isMatch = false;
                break;
              }
            }
          }
          if (isMatch) {
            discriminatedUnionSchema = variant;
            break;
          }
        }
      }
    }
    schemaKeys = new Set([
      ...unionKeys,
      ...Object.keys(schema.properties ?? {}),
      ...schema.additionalProperties ? formData.keys() : []
    ].filter((key) => !key.startsWith("__superform_")));
  }
  function parseSingleEntry(key, entry, info) {
    if (options?.preprocessed && options.preprocessed.includes(key)) {
      return entry;
    }
    if (entry && typeof entry !== "string") {
      const allowFiles = legacyMode ? options?.allowFiles === true : options?.allowFiles !== false;
      return !allowFiles ? void 0 : entry.size ? entry : info.isNullable ? null : void 0;
    }
    if (info.types.length > 1 && !isCompatibleTypeUnion(info.types)) {
      throw new SchemaError(unionError, key);
    }
    let [type] = info.types;
    if (entry && !info.types.length && info.schema.enum) {
      if (info.schema.enum.includes(entry))
        type = "string";
      else {
        type = Number.isInteger(parseInt(entry, 10)) ? "integer" : "string";
      }
    }
    return parseFormDataEntry(key, entry, type ?? "any", info, fromURL);
  }
  const defaultPropertyType = typeof schema.additionalProperties == "object" ? schema.additionalProperties : { type: "string" };
  for (const key of schemaKeys) {
    const property = discriminatedUnionSchema?.properties ? discriminatedUnionSchema.properties[key] : schema.properties ? schema.properties[key] : defaultPropertyType;
    assertSchema(property, key);
    const info = schemaInfo(property ?? defaultPropertyType, !schema.required?.includes(key), [
      key
    ]);
    if (!info)
      continue;
    if (!info.types.includes("boolean") && !schema.additionalProperties && !formData.has(key)) {
      continue;
    }
    const entries = formData.getAll(key);
    if (info.union && info.union.length > 1 && !isCompatibleUnionSchema(info.union)) {
      throw new SchemaError(unionError, key);
    }
    if (info.types.includes("array") || info.types.includes("set")) {
      const items = property.items ?? (info.union?.length == 1 ? info.union[0] : void 0);
      if (!items || typeof items == "boolean" || Array.isArray(items) && items.length != 1) {
        throw new SchemaError('Arrays must have a single "items" property that defines its type.', key);
      }
      const arrayType = Array.isArray(items) ? items[0] : items;
      assertSchema(arrayType, key);
      const arrayInfo = schemaInfo(arrayType, info.isOptional, [key]);
      if (!arrayInfo)
        continue;
      const isFileArray = entries.length && entries.some((e) => e && typeof e !== "string");
      const arrayData = entries.map((e) => parseSingleEntry(key, e, arrayInfo));
      if (isFileArray && arrayData.every((file) => !file))
        arrayData.length = 0;
      output[key] = info.types.includes("set") ? new Set(arrayData) : arrayData;
    } else {
      output[key] = parseSingleEntry(key, entries[entries.length - 1], info);
    }
  }
  return output;
}
function parseFormDataEntry(key, value, type, info, fromURL = false) {
  if (!value) {
    if (!fromURL && type == "boolean" && info.isOptional && info.schema.default === true) {
      return false;
    }
    const defaultValue2 = defaultValues(info.schema, info.isOptional, [key]);
    if (info.schema.enum && defaultValue2 !== null && defaultValue2 !== void 0) {
      return value;
    }
    if ("const" in info.schema) {
      return value;
    }
    if (defaultValue2 !== void 0)
      return defaultValue2;
    if (info.isNullable)
      return null;
    if (info.isOptional)
      return void 0;
  }
  function typeError() {
    throw new SchemaError(type[0].toUpperCase() + type.slice(1) + ` type found. Set the dataType option to "json" and add use:enhance on the client to use nested data structures. More information: https://superforms.rocks/concepts/nested-data`, key);
  }
  switch (type) {
    case "string":
    case "any":
      return value;
    case "integer":
      return parseInt(value ?? "", 10);
    case "number":
      return parseFloat(value ?? "");
    case "boolean":
      return Boolean(value == "false" ? "" : value).valueOf();
    case "stringbool":
      return value;
    case "unix-time": {
      const date = new Date(value ?? "");
      return !isNaN(date) ? date : void 0;
    }
    case "int64":
    case "bigint":
      return BigInt(value ?? ".");
    case "symbol":
      return Symbol(String(value));
    case "set":
    case "array":
    case "object":
      return typeError();
    default:
      throw new SuperFormError("Unsupported schema type for FormData: " + type);
  }
}
async function superValidate(data, adapter, options) {
  if (data && "superFormValidationLibrary" in data) {
    options = adapter;
    adapter = data;
    data = void 0;
  }
  const validator = adapter;
  const defaults = options?.defaults ?? validator.defaults;
  const jsonSchema = validator.jsonSchema;
  const parsed = await parseRequest(data, jsonSchema, options);
  const addErrors = options?.errors ?? (options?.strict ? true : !!parsed.data);
  const parsedData = options?.strict ? parsed.data ?? {} : mergeDefaults(parsed.data, defaults);
  let status;
  if (!!parsed.data || addErrors) {
    status = await /* @__PURE__ */ validator.validate(parsedData);
  } else {
    status = { success: false, issues: [] };
  }
  const valid = status.success;
  const errors = valid || !addErrors ? {} : mapErrors(status.issues, validator.shape);
  const dataWithDefaults = valid ? status.data : replaceInvalidDefaults(options?.strict ? mergeDefaults(parsedData, defaults) : parsedData, defaults, jsonSchema, status.issues, options?.preprocessed);
  let outputData;
  if (jsonSchema.additionalProperties === false) {
    outputData = {};
    for (const key of Object.keys(jsonSchema.properties ?? {})) {
      if (key in dataWithDefaults)
        outputData[key] = dataWithDefaults[key];
    }
  } else {
    outputData = dataWithDefaults;
  }
  const output = {
    id: parsed.id ?? options?.id ?? validator.id,
    valid,
    posted: parsed.posted,
    errors,
    data: outputData
  };
  if (!parsed.posted) {
    output.constraints = validator.constraints;
    if (Object.keys(validator.shape).length) {
      output.shape = validator.shape;
    }
  }
  return output;
}
const memoize = baseMemoize;
class TDate extends Type.Base {
  Check(value) {
    return value instanceof globalThis.Date;
  }
  Errors(value) {
    return this.Check(value) ? [] : [{ message: "must be Date" }];
  }
  Create() {
    return new globalThis.Date(0);
  }
}
const defaultJSONSchemaOptions = {
  unrepresentable: "any",
  override: (ctx) => {
    const def = ctx.zodSchema._zod.def;
    if (def.type === "date") {
      ctx.jsonSchema.type = "integer";
      ctx.jsonSchema.format = "unix-time";
    } else if (def.type === "bigint") {
      ctx.jsonSchema.type = "string";
      ctx.jsonSchema.format = "bigint";
    } else if (def.type === "pipe") {
      const pipeDef = def;
      const inSchema = pipeDef.in;
      const outSchema = pipeDef.out;
      if (inSchema?._zod?.def.type === "string") {
        let currentSchema = outSchema;
        let isStringBool = false;
        while (currentSchema?._zod?.def) {
          const currentDef = currentSchema._zod.def;
          if (currentDef.type === "boolean") {
            isStringBool = true;
            break;
          } else if (currentDef.type === "transform") {
            break;
          } else if (currentDef.type === "pipe") {
            const nestedPipeDef = currentDef;
            currentSchema = nestedPipeDef.out;
          } else {
            break;
          }
        }
        if (!isStringBool && outSchema?._zod?.def.type === "boolean") {
          isStringBool = true;
        }
        if (isStringBool) {
          ctx.jsonSchema.type = "string";
          ctx.jsonSchema.format = "stringbool";
        }
      }
    } else if (def.type === "set") {
      ctx.jsonSchema.type = "array";
      ctx.jsonSchema.uniqueItems = true;
      if ("default" in ctx.jsonSchema && ctx.jsonSchema.default instanceof Set) {
        ctx.jsonSchema.default = Array.from(ctx.jsonSchema.default);
      }
    } else if (def.type === "map") {
      ctx.jsonSchema.type = "array";
      ctx.jsonSchema.format = "map";
      if ("default" in ctx.jsonSchema && ctx.jsonSchema.default instanceof Map) {
        ctx.jsonSchema.default = Array.from(ctx.jsonSchema.default);
      }
    } else if (def.type === "default") {
      const innerDef = def.innerType._zod.def;
      if (innerDef.type === "set" && def.defaultValue instanceof Set) {
        ctx.jsonSchema.type = "array";
        ctx.jsonSchema.uniqueItems = true;
        ctx.jsonSchema.default = Array.from(def.defaultValue);
      } else if (innerDef.type === "map" && def.defaultValue instanceof Map) {
        ctx.jsonSchema.type = "array";
        ctx.jsonSchema.format = "map";
        ctx.jsonSchema.default = Array.from(def.defaultValue);
      }
    }
  }
};
const zodToJSONSchema = /* @__NO_SIDE_EFFECTS__ */ (schema, options) => {
  return toJSONSchema(schema, { ...defaultJSONSchemaOptions, ...options });
};
async function validate(schema, data, error) {
  if (error === void 0) {
    const zConfig = config();
    error = zConfig.customError ?? zConfig.localeError;
  }
  const result = await safeParseAsync(schema, data, { error });
  if (result.success) {
    return {
      data: result.data,
      success: true
    };
  }
  return {
    issues: result.error.issues.map(({ message, path }) => ({ message, path })),
    success: false
  };
}
function _zod4(schema, options) {
  return /* @__PURE__ */ createAdapter({
    superFormValidationLibrary: "zod4",
    validate: async (data) => {
      return validate(schema, data, options?.error);
    },
    jsonSchema: options?.jsonSchema ?? /* @__PURE__ */ zodToJSONSchema(schema, options?.config),
    defaults: options?.defaults
  });
}
const zod = /* @__PURE__ */ memoize(_zod4);
const userSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
const gameSessionSchema = z.object({
  gameMode: z.enum(["manual", "automated", "played-card"]),
  selectedPlayers: z.enum(["random", "specific"]),
  contractLevel: z.string().optional(),
  declarerPosition: z.enum(["north", "south", "east", "west"]).optional()
});
z.object({
  cardId: z.string().min(1, "Please select a card"),
  playerId: z.string().min(1, "Player ID is required"),
  trickId: z.string().optional()
});
z.object({
  hand: z.array(z.object({
    suit: z.enum(["spades", "hearts", "diamonds", "clubs"]),
    rank: z.enum(["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"])
  })).length(13, "A bridge hand must have exactly 13 cards"),
  isDeclarer: z.boolean().default(false),
  isDummy: z.boolean().default(false)
});
z.object({
  level: z.number().min(1).max(7, "Contract level must be between 1 and 7"),
  suit: z.enum(["clubs", "diamonds", "hearts", "spades", "nt"]),
  declarer: z.enum(["north", "south", "east", "west"]),
  vulnerability: z.enum(["none", "ns", "ew", "both"]).default("none")
});
z.object({
  accuracy: z.number().min(0).max(100, "Accuracy must be between 0 and 100"),
  speed: z.number().min(0, "Speed must be a positive number"),
  hintsUsed: z.number().min(0, "Hints used must be non-negative"),
  mistakes: z.number().min(0, "Mistakes must be non-negative"),
  score: z.number().min(0, "Score must be non-negative"),
  difficulty: z.enum(["easy", "medium", "hard", "expert"])
});
z.object({
  theme: z.enum(["light", "dark", "auto"]).default("light"),
  soundEnabled: z.boolean().default(true),
  animationsEnabled: z.boolean().default(true),
  difficulty: z.enum(["easy", "medium", "hard", "expert"]).default("medium"),
  language: z.enum(["en", "es", "fr", "de", "it", "pt"]).default("en"),
  notifications: z.boolean().default(true),
  autoSave: z.boolean().default(true)
});
const load = async () => {
  const loginForm = await superValidate(zod(userSchema));
  const gameSessionForm = await superValidate(zod(gameSessionSchema));
  return {
    loginForm,
    gameSessionForm
  };
};
const actions = {
  login: async ({ request, cookies }) => {
    const form = await superValidate(request, zod(userSchema));
    if (!form.valid) {
      return fail(400, { form });
    }
    try {
      const result = await auth.api.signInEmail({
        body: {
          email: form.data.email,
          password: form.data.password
        },
        headers: { cookie: cookies.toString() }
      });
      if (result.user) {
        throw redirect(302, "/dashboard");
      }
      return fail(400, { form, message: "Invalid credentials" });
    } catch (error) {
      return fail(500, { form, message: "Authentication failed" });
    }
  },
  register: async ({ request, cookies }) => {
    const form = await superValidate(request, zod(userSchema));
    if (!form.valid) {
      return fail(400, { form });
    }
    try {
      const result = await auth.api.signUpEmail({
        body: {
          email: form.data.email,
          password: form.data.password,
          name: form.data.name
        },
        headers: { cookie: cookies.toString() }
      });
      if (result.user) {
        const loginResult = await auth.api.signInEmail({
          body: {
            email: form.data.email,
            password: form.data.password
          },
          headers: { cookie: cookies.toString() }
        });
        if (loginResult.user) {
          throw redirect(302, "/dashboard");
        }
      }
      return fail(400, { form, message: "Registration failed" });
    } catch (error) {
      return fail(500, { form, message: "Registration failed" });
    }
  },
  createGameSession: async ({ request, cookies }) => {
    const form = await superValidate(request, zod(gameSessionSchema));
    if (!form.valid) {
      return fail(400, { form });
    }
    const session = await auth.api.getSession({
      headers: { cookie: cookies.toString() }
    });
    if (!session?.user) {
      return fail(401, { form, message: "Authentication required" });
    }
    try {
      return { form, success: true, message: "Game session created" };
    } catch (error) {
      return fail(500, { form, message: "Failed to create game session" });
    }
  }
};
export {
  actions,
  load
};
