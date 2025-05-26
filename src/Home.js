import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, query, where, doc, updateDoc, deleteDoc, getDoc } from './firebase';
import {
    Typography, Container, Avatar, Card, CardContent, CardActions, TextField, IconButton, Box,
    CircularProgress, MenuItem, Snackbar, Radio, RadioGroup, FormControlLabel, FormControl,
    FormLabel, Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import MuiAlert from '@mui/material/Alert';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';

const gradeOptions = ["A", "B+", "B", "C+", "C", "D", "F", "W", "P"];
const termOptions = ["Fall", "Spring", "Winter", "Summer"];
const yearOptions = Array.from(new Array(30), (_, index) => new Date().getFullYear() - index);
const locationOptions = ["In person", "Hybrid", "Online"];

function Home({ user }) {
    const [reviews, setReviews] = useState([]);
    const [editMode, setEditMode] = useState({});
    const [editedReview, setEditedReview] = useState({});
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('success');

    const fetchUserReviews = async () => {
        setLoading(true);
        if (user) {
            const userDocRef = collection(db, 'users', user.uid, 'reviewedSubjects');
            const userDocSnapshot = await getDocs(userDocRef);

            const allReviews = [];
            for (const subjectDoc of userDocSnapshot.docs) {
                const reviewsCollection = collection(db, 'subjects', subjectDoc.id, 'reviews');
                const q = query(reviewsCollection, where('userId', '==', user.uid));
                const querySnapshot = await getDocs(q);

                querySnapshot.docs.forEach((reviewDoc) => {
                    allReviews.push({ id: reviewDoc.id, subjectId: subjectDoc.id, ...reviewDoc.data() });
                });
            }

            setReviews(allReviews);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUserReviews();
    }, [user]);

    const validateForm = () => {
        if (editedReview.reviewTitle.length > 125) {
            setMessage('Review title must be no more than 125 characters.');
            setSeverity('error');
            setOpen(true);
            return false;
        }
        if (editedReview.professor.length > 50) {
            setMessage('Professor name must be no more than 50 characters.');
            setSeverity('error');
            setOpen(true);
            return false;
        }
        if (editedReview.review.length > 750) {
            setMessage('Review must be no more than 750 characters.');
            setSeverity('error');
            setOpen(true);
            return false;
        }
        return true;
    };

    const handleEdit = (id, review) => {
        setEditMode({ [id]: true });
        setEditedReview(review);
    };

    const handleSave = async (id) => {
        if (!validateForm()) return;

        const reviewDoc = doc(db, 'subjects', editedReview.subjectId, 'reviews', id);
        await updateDoc(reviewDoc, editedReview);
        setEditMode({ [id]: false });
        fetchUserReviews();
        setMessage('Review updated successfully!');
        setSeverity('success');
        setOpen(true);
    };

    const handleCancel = (id) => {
        setEditMode({ [id]: false });
    };

    const handleDelete = async (id, subjectId) => {
        const reviewDoc = doc(db, 'subjects', subjectId, 'reviews', id);
        await deleteDoc(reviewDoc);

        const userDocRef = doc(db, 'users', user.uid, 'reviewedSubjects', subjectId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const newCount = userDoc.data().reviewCount - 1;
            if (newCount > 0) {
                await updateDoc(userDocRef, { reviewCount: newCount });
            } else {
                await deleteDoc(userDocRef);
            }
        }

        setReviews(reviews.filter(review => review.id !== id));
        setMessage('Review deleted successfully!');
        setSeverity('success');
        setOpen(true);
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    const getFaceIcon = (value) => {
        switch (value) {
            case '1':
                return <SentimentVeryDissatisfiedIcon style={{ color: '#f44336', fontSize: 30 }} />;
            case '2':
                return <SentimentDissatisfiedIcon style={{ color: '#ff9800', fontSize: 30 }} />;
            case '3':
                return <SentimentSatisfiedIcon style={{ color: '#ffeb3b', fontSize: 30 }} />;
            case '4':
                return <SentimentSatisfiedAltIcon style={{ color: '#8bc34a', fontSize: 30 }} />;
            case '5':
                return <SentimentVerySatisfiedIcon style={{ color: '#4caf50', fontSize: 30 }} />;
            default:
                return null;
        }
    };

    return (
        <Container>
            <Box mt={4} display="flex" alignItems="center" flexDirection="column">
                <Avatar src={user.photoURL} alt={user.displayName} style={{ width: 100, height: 100, marginBottom: 20 }} />
                <Typography variant="h4" gutterBottom>
                    Hello, {user.displayName.split(' ')[0]}!
                </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" gutterBottom>
                    Your Reviews
                </Typography>
                <IconButton onClick={fetchUserReviews}>
                    <RefreshIcon />
                </IconButton>
            </Box>
            {loading ? (
                <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress />
                </Box>
            ) : reviews.length > 0 ? (
                reviews.map(review => (
                    <Card key={review.id} variant="outlined" style={{ margin: '16px 0' }}>
                        <CardContent>
                            {editMode[review.id] ? (
                                <>
                                    <TextField
                                        label="Review Title"
                                        value={editedReview.reviewTitle}
                                        onChange={(e) => setEditedReview({ ...editedReview, reviewTitle: e.target.value })}
                                        fullWidth
                                        margin="normal"
                                    />
                                    <TextField
                                        label="Review"
                                        value={editedReview.review}
                                        onChange={(e) => setEditedReview({ ...editedReview, review: e.target.value })}
                                        fullWidth
                                        multiline
                                        rows={4}
                                        margin="normal"
                                    />
                                    <TextField
                                        label="Professor"
                                        value={editedReview.professor}
                                        onChange={(e) => setEditedReview({ ...editedReview, professor: e.target.value })}
                                        fullWidth
                                        margin="normal"
                                    />
                                    <TextField
                                        select
                                        label="Grade"
                                        value={editedReview.grade}
                                        onChange={(e) => setEditedReview({ ...editedReview, grade: e.target.value })}
                                        fullWidth
                                        margin="normal"
                                    >
                                        {gradeOptions.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                    <Box display="flex" justifyContent="space-between">
                                        <TextField
                                            select
                                            label="Term"
                                            name="term"
                                            value={editedReview.term}
                                            onChange={(e) => setEditedReview({ ...editedReview, term: e.target.value })}
                                            margin="normal"
                                            style={{ flex: 1, marginRight: '8px' }}
                                        >
                                            {termOptions.map((option) => (
                                                <MenuItem key={option} value={option}>
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                        <TextField
                                            select
                                            label="Year"
                                            name="year"
                                            value={editedReview.year}
                                            onChange={(e) => setEditedReview({ ...editedReview, year: e.target.value })}
                                            margin="normal"
                                            style={{ flex: 1, marginLeft: '8px' }}
                                        >
                                            {yearOptions.map((option) => (
                                                <MenuItem key={option} value={option}>
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Box>
                                    <TextField
                                        select
                                        label="Location"
                                        name="location"
                                        value={editedReview.location}
                                        onChange={(e) => setEditedReview({ ...editedReview, location: e.target.value })}
                                        fullWidth
                                        margin="normal"
                                    >
                                        {locationOptions.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                    <FormControl component="fieldset" margin="normal" fullWidth>
                                        <FormLabel component="legend">Overall Rating</FormLabel>
                                        <RadioGroup
                                            row
                                            value={editedReview.overallRating}
                                            onChange={(e) => setEditedReview({ ...editedReview, overallRating: e.target.value })}
                                        >
                                            <FormControlLabel value="1" control={<Radio icon={<SentimentVeryDissatisfiedIcon />} checkedIcon={<SentimentVeryDissatisfiedIcon style={{ color: '#f44336' }} />} />} />
                                            <FormControlLabel value="2" control={<Radio icon={<SentimentDissatisfiedIcon />} checkedIcon={<SentimentDissatisfiedIcon style={{ color: '#ff9800' }} />} />} />
                                            <FormControlLabel value="3" control={<Radio icon={<SentimentSatisfiedIcon />} checkedIcon={<SentimentSatisfiedIcon style={{ color: '#ffeb3b' }} />} />} />
                                            <FormControlLabel value="4" control={<Radio icon={<SentimentSatisfiedAltIcon />} checkedIcon={<SentimentSatisfiedAltIcon style={{ color: '#8bc34a' }} />} />} />
                                            <FormControlLabel value="5" control={<Radio icon={<SentimentVerySatisfiedIcon />} checkedIcon={<SentimentVerySatisfiedIcon style={{ color: '#4caf50' }} />} />} />
                                        </RadioGroup>
                                    </FormControl>
                                    <FormControl component="fieldset" margin="normal" fullWidth>
                                        <FormLabel component="legend">Class Difficulty</FormLabel>
                                        <RadioGroup
                                            row
                                            value={editedReview.difficulty}
                                            onChange={(e) => setEditedReview({ ...editedReview, difficulty: e.target.value })}
                                        >
                                            <FormControlLabel value="1" control={<Radio icon={<SentimentVeryDissatisfiedIcon />} checkedIcon={<SentimentVeryDissatisfiedIcon style={{ color: '#f44336' }} />} />} />
                                            <FormControlLabel value="2" control={<Radio icon={<SentimentDissatisfiedIcon />} checkedIcon={<SentimentDissatisfiedIcon style={{ color: '#ff9800' }} />} />} />
                                            <FormControlLabel value="3" control={<Radio icon={<SentimentSatisfiedIcon />} checkedIcon={<SentimentSatisfiedIcon style={{ color: '#ffeb3b' }} />} />} />
                                            <FormControlLabel value="4" control={<Radio icon={<SentimentSatisfiedAltIcon />} checkedIcon={<SentimentSatisfiedAltIcon style={{ color: '#8bc34a' }} />} />} />
                                            <FormControlLabel value="5" control={<Radio icon={<SentimentVerySatisfiedIcon />} checkedIcon={<SentimentVerySatisfiedIcon style={{ color: '#4caf50' }} />} />} />
                                        </RadioGroup>
                                    </FormControl>
                                    <FormControl component="fieldset" margin="normal" fullWidth>
                                        <FormLabel component="legend">Workload</FormLabel>
                                        <RadioGroup
                                            row
                                            value={editedReview.workload}
                                            onChange={(e) => setEditedReview({ ...editedReview, workload: e.target.value })}
                                        >
                                            <FormControlLabel value="1" control={<Radio icon={<SentimentVeryDissatisfiedIcon />} checkedIcon={<SentimentVeryDissatisfiedIcon style={{ color: '#f44336' }} />} />} />
                                            <FormControlLabel value="2" control={<Radio icon={<SentimentDissatisfiedIcon />} checkedIcon={<SentimentDissatisfiedIcon style={{ color: '#ff9800' }} />} />} />
                                            <FormControlLabel value="3" control={<Radio icon={<SentimentSatisfiedIcon />} checkedIcon={<SentimentSatisfiedIcon style={{ color: '#ffeb3b' }} />} />} />
                                            <FormControlLabel value="4" control={<Radio icon={<SentimentSatisfiedAltIcon />} checkedIcon={<SentimentSatisfiedAltIcon style={{ color: '#8bc34a' }} />} />} />
                                            <FormControlLabel value="5" control={<Radio icon={<SentimentVerySatisfiedIcon />} checkedIcon={<SentimentVerySatisfiedIcon style={{ color: '#4caf50' }} />} />} />
                                        </RadioGroup>
                                    </FormControl>
                                    <FormControl component="fieldset" margin="normal" fullWidth>
                                        <FormLabel component="legend">Would Take Again</FormLabel>
                                        <RadioGroup
                                            row
                                            value={editedReview.takeAgain}
                                            onChange={(e) => setEditedReview({ ...editedReview, takeAgain: e.target.value })}
                                        >
                                            <FormControlLabel value="1" control={<Radio icon={<SentimentVeryDissatisfiedIcon />} checkedIcon={<SentimentVeryDissatisfiedIcon style={{ color: '#f44336' }} />} />} />
                                            <FormControlLabel value="2" control={<Radio icon={<SentimentDissatisfiedIcon />} checkedIcon={<SentimentDissatisfiedIcon style={{ color: '#ff9800' }} />} />} />
                                            <FormControlLabel value="3" control={<Radio icon={<SentimentSatisfiedIcon />} checkedIcon={<SentimentSatisfiedIcon style={{ color: '#ffeb3b' }} />} />} />
                                            <FormControlLabel value="4" control={<Radio icon={<SentimentSatisfiedAltIcon />} checkedIcon={<SentimentSatisfiedAltIcon style={{ color: '#8bc34a' }} />} />} />
                                            <FormControlLabel value="5" control={<Radio icon={<SentimentVerySatisfiedIcon />} checkedIcon={<SentimentVerySatisfiedIcon style={{ color: '#4caf50' }} />} />} />
                                        </RadioGroup>
                                    </FormControl>
                                    <FormControl component="fieldset" margin="normal" fullWidth>
                                        <FormLabel component="legend">Professor Rating</FormLabel>
                                        <RadioGroup
                                            row
                                            value={editedReview.professorRating}
                                            onChange={(e) => setEditedReview({ ...editedReview, professorRating: e.target.value })}
                                        >
                                            <FormControlLabel value="1" control={<Radio icon={<SentimentVeryDissatisfiedIcon />} checkedIcon={<SentimentVeryDissatisfiedIcon style={{ color: '#f44336' }} />} />} />
                                            <FormControlLabel value="2" control={<Radio icon={<SentimentDissatisfiedIcon />} checkedIcon={<SentimentDissatisfiedIcon style={{ color: '#ff9800' }} />} />} />
                                            <FormControlLabel value="3" control={<Radio icon={<SentimentSatisfiedIcon />} checkedIcon={<SentimentSatisfiedIcon style={{ color: '#ffeb3b' }} />} />} />
                                            <FormControlLabel value="4" control={<Radio icon={<SentimentSatisfiedAltIcon />} checkedIcon={<SentimentSatisfiedAltIcon style={{ color: '#8bc34a' }} />} />} />
                                            <FormControlLabel value="5" control={<Radio icon={<SentimentVerySatisfiedIcon />} checkedIcon={<SentimentVerySatisfiedIcon style={{ color: '#4caf50' }} />} />} />
                                        </RadioGroup>
                                    </FormControl>
                                </>
                            ) : (
                                <>
                                    <Typography variant="h6" style={{ fontWeight: 'bold' }}>{review.reviewTitle}</Typography>
                                    <Typography paragraph>{review.review}</Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Professor: {review.professor}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Grade: {review.grade}
                                    </Typography>
                                    <Grid container spacing={2} mt={2}>
                                        <Grid item xs={6} sm={4} md={2}>
                                            <Typography component="legend">Overall Rating</Typography>
                                            {getFaceIcon(review.overallRating)}
                                        </Grid>
                                        <Grid item xs={6} sm={4} md={2}>
                                            <Typography component="legend">Class Difficulty</Typography>
                                            {getFaceIcon(review.difficulty)}
                                        </Grid>
                                        <Grid item xs={6} sm={4} md={2}>
                                            <Typography component="legend">Workload</Typography>
                                            {getFaceIcon(review.workload)}
                                        </Grid>
                                        <Grid item xs={6} sm={4} md={2}>
                                            <Typography component="legend">Would Take Again</Typography>
                                            {getFaceIcon(review.takeAgain)}
                                        </Grid>
                                        <Grid item xs={6} sm={4} md={2}>
                                            <Typography component="legend">Professor Rating</Typography>
                                            {getFaceIcon(review.professorRating)}
                                        </Grid>
                                    </Grid>
                                </>
                            )}
                        </CardContent>
                        <CardActions>
                            {editMode[review.id] ? (
                                <>
                                    <IconButton onClick={() => handleSave(review.id)}><SaveIcon /></IconButton>
                                    <IconButton onClick={() => handleCancel(review.id)}><CancelIcon /></IconButton>
                                </>
                            ) : (
                                <>
                                    <IconButton onClick={() => handleEdit(review.id, review)}><EditIcon /></IconButton>
                                    <IconButton onClick={() => handleDelete(review.id, review.subjectId)}><DeleteIcon /></IconButton>
                                </>
                            )}
                        </CardActions>
                    </Card>
                ))
            ) : (
                <Typography variant="body2" color="textSecondary">
                    You have not written any reviews yet.
                </Typography>
            )}
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <MuiAlert onClose={handleClose} severity={severity}>
                    {message}
                </MuiAlert>
            </Snackbar>
        </Container>
    );
}

export default Home;