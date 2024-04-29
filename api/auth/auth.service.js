const { PrismaClient } = require("@prisma/client");
const argon = require("argon2");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const prisma = new PrismaClient();

dotenv.config({ path: "./.env" });
module.exports = {
  signUp: async (req, res) => {
    const { username, password } = req.body;
    const hash = await argon.hash(password);

    const userExists = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (!userExists) {
      try {
        try {
          const newUser = await prisma.user.create({
            data: {
              username,
              password: hash,
            },
          });

          if (newUser) {
            try {
              await prisma.role.create({
                data: {
                  role: "super".toLocaleLowerCase().trim(),
                  canEdit: true,
                  canSell: true,
                  canDelete: true,
                  canRevoke: true,
                  canMonitor: true,
                  userId: newUser.id,
                },
              });
            } catch (error) {
              return res.status(500).json({
                success: 0,
                data: "An Error Occurred in creating User Role",
                error,
              });
            }
          }
        } catch (error) {
          return res.status(500).json({
            success: 0,
            data: "An Error Occurred in User creation",
            error,
          });
        }

        return res.status(201).json({
          success: 1,
          data: "Sign Up success!!",
        });
      } catch (error) {
        return res.status(500).json({
          success: 0,
          data: "An Error Occurred",
          error,
        });
      }
    }

    return res.status(401).json({
      success: 0,
      data: "User already Exists",
    });
  },
  signIn: async (req, res) => {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (user) {
      const comparePassword = await argon.verify(user.password, password);

      if (comparePassword) {
        user.password = undefined;
        const payload = {
          user,
        };

        const secret = process.env.SECRET;

        const token = jwt.sign({ payload }, secret, {
          expiresIn: "1h",
        });

        const saveCookie = res.cookie("jwt", token, {
          httpOnly: true,
          sameSite: "None",
          secure: true,
          maxAge: 24 * 60 * 60 * 1000,
        });

        if (saveCookie) {
            return res.status(200).json({
                success: 1,
                data: "login success",
                token,
              });
        }

        return res.status(401).json({
          success: 0,
          data: "cookie error",
          token,
        });
      }

      return res.status(401).json({
        success: 0,
        data: "Invalid Credentials",
      });
    }

    return res.status(401).json({
      success: 0,
      data: "Invalid Credentials",
    });
  },

  logout: (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.sendStatus(401);

    const clearCookie = res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });

    if (!clearCookie) {
      res.sendStatus(500);
    }

    return res.status(200).json({
      success: 1,
      data: "logout success",
    });
  },
};
