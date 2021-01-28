import express from 'express';

const router = express.Router();

// @desc    Login/Landing page
// @route   GET /
router.get('/', (req, res) => {
    res.render('login', {
      layout: 'login',
    })
  })
// @desc    Dashboard
// @route   GET /dashboard
router.get('/dashboard', async (req, res) => {
    try {
      res.render('dashboard', {
        name: req.user.firstName
      })
    } catch (err) {
      console.error(err)
      res.render('error/500')
    }
  })
  export default router;