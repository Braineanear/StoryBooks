import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile']}));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/'}), (req, res) => {
    res.redirect('/dashboard');
});

export default router;