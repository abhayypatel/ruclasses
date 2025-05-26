import React, { useState, useEffect } from 'react';
import { db, auth, provider, collection, getDocs } from './firebase';
import { signInWithPopup } from 'firebase/auth';
import { AppBar, Toolbar, Button, Typography, Container, Box, IconButton, Drawer, List, ListItem, ListItemText, Hidden, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import WriteReview from './WriteReview';
import ViewReviews from './ViewReviews';
import Home from './Home';

function App() {
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [currentView, setCurrentView] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    auth.onAuthStateChanged(user => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    const fetchSubjects = async () => {
      const subjectsCollection = collection(db, 'subjects');
      const subjectsSnapshot = await getDocs(subjectsCollection);
      const subjectsList = subjectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSubjects(subjectsList);
    };

    fetchSubjects();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div style={{ width: 250 }}>
      <List>
        <ListItem button onClick={() => { setCurrentView('home'); setMobileOpen(false); }}>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button onClick={() => { setCurrentView('write'); setMobileOpen(false); }}>
          <ListItemText primary="Write Review" />
        </ListItem>
        <ListItem button onClick={() => { setCurrentView('view'); setMobileOpen(false); }}>
          <ListItemText primary="View Reviews" />
        </ListItem>
        <Divider />
        <ListItem button onClick={() => { auth.signOut(); setMobileOpen(false); }}>
          <ListItemText primary="Sign Out" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <Container>
      <AppBar position="static" style={{ backgroundColor: '#CC0033' }}>
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1, color: '#FFFFFF' }}>
            RUClasses
          </Typography>
          {user ? (
            <>
              <Hidden smUp>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="end"
                  onClick={handleDrawerToggle}
                >
                  <MenuIcon />
                </IconButton>
              </Hidden>
              <Hidden smDown>
                <Button color="inherit" style={{ color: '#FFFFFF' }} onClick={() => setCurrentView('home')}>
                  Home
                </Button>
                <Button color="inherit" style={{ color: '#FFFFFF' }} onClick={() => setCurrentView('write')}>
                  Write Review
                </Button>
                <Button color="inherit" style={{ color: '#FFFFFF' }} onClick={() => setCurrentView('view')}>
                  View Reviews
                </Button>
                <Button color="inherit" style={{ color: '#FFFFFF' }} onClick={() => auth.signOut()}>
                  Sign Out
                </Button>
              </Hidden>
            </>
          ) : (
            <Button color="inherit" style={{ color: '#FFFFFF' }} onClick={signInWithGoogle}>
              Sign In
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <nav>
        <Hidden smUp>
          <Drawer
            anchor="right"
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
      <Box mt={4}>
        {user ? (
          <div>
            {currentView === 'home' && <Home user={user} />}
            {currentView === 'write' && <WriteReview subjects={subjects} user={user} />}
            {currentView === 'view' && <ViewReviews subjects={subjects} />}
          </div>
        ) : (
          <Container style={{ textAlign: 'center', marginTop: '20px' }}>
            <Typography variant="h5" gutterBottom>
              Sign in to access RUClasses
            </Typography>
            <Button variant="contained" color="primary" onClick={signInWithGoogle}>
              Sign In with Google
            </Button>
          </Container>
        )}
      </Box>
    </Container>
  );
}

export default App;
