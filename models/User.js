"use strict";
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    correctPassword = async function (candidatePassword, userPassword) {
      //console.log(await bcrypt.compare(candidatePassword, userPassword));
      return await bcrypt.compare(candidatePassword, userPassword);
    };
    changedPasswordAfter = function (JWTTimestamp) {
      if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
          this.passwordChangedAt.getTime() / 1000,
          10
        );
        return JWTTimestamp < changedTimestamp;
      }
      return false;
    };
    createPasswordResetToken = function () {
      const restToken = crypto.randomBytes(32).toString("hex");

      this.passwordResetToken = crypto
        .createHash("sha256")
        .update(restToken)
        .digest("hex");

      this.passwordResetDate = Date.now() + 10 * 60 * 1000;
      return restToken;
    };
    static associate(models) {
      // define association here
    }
    toJSON() {
      return {
        ...this.get(),
        id: undefined,
        password: undefined,
        passwordConfirm: undefined,
        active: undefined,
        passwordResetToken: undefined,
        passwordResetDate: undefined,
      };
    }
  }
  User.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "A user must have a name" },
          notEmpty: { msg: "A user must have a name" },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
          notNull: { msg: "A user must have an Email" },
          notEmpty: { msg: "A user must have an Email" },
        },
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: "Phone number must be unique" },
        validate: {
          notNull: { msg: "A user must have a phone number" },
          notEmpty: { msg: "A user must have a phone number" },
        },
      },
      role: {
        type: DataTypes.ENUM({
          values: ["admin", "parent", "staff", "teacher"],
        }),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "A user must have a password" },
        },
      },
      passwordConfirm: {
        type: DataTypes.STRING,
      },
      passwordChangedAt: { type: DataTypes.DATE },
      passwordResetToken: { type: DataTypes.STRING },
      passwordResetDate: { type: DataTypes.DATE },
      active: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      hooks: {
        beforeValidate: async (user, options) => {
          //console.log(user);
          if (!user._changed.has("password")) {
            //console.log("test1");
            return;
          }
          if (user.isNewRecord && user.passwordConfirm !== user.password) {
            //console.log(user.passwordConfirm, user.password);
            //console.log("test2");
            throw new Error("The confirmed password is not the same");
          }
          //console.log(user.password);
          user.password = await bcrypt.hash(user.password, 12);
          user.passwordConfirm = undefined;
        },

        // afterValidate: (user, options) => {
        //   console.log("test2");
        // },
      },
      sequelize,
      tableName: "users",
      modelName: "User",
    }
  );
  return User;
};
