// src/WriteReview.js
import React, { useState } from 'react';
import { db, collection, addDoc, doc, getDoc, setDoc, updateDoc } from './firebase';
import { TextField, Button, MenuItem, Typography, Container, Snackbar, Box, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import { subjects } from './subjects'; // Import the subjects list

const gradeOptions = ["A", "B+", "B", "C+", "C", "D", "F", "W", "P"];
const termOptions = ["Fall", "Spring", "Winter", "Summer"];
const yearOptions = Array.from(new Array(30), (_, index) => new Date().getFullYear() - index); // Last 30 years
const locationOptions = ["In person", "Hybrid", "Online"];

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

function WriteReview({ user }) {
    const [review, setReview] = useState({
        subjectCode: '',
        classCode: '',
        term: '',
        year: '',
        location: '',
        professor: '',
        reviewTitle: '',
        review: '',
        grade: '',
        overallRating: '',
        difficulty: '',
        workload: '',
        takeAgain: '',
        professorRating: ''
    });
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('success');

    const handleChange = (e) => {
        setReview({ ...review, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate the form
        if (!review.subjectCode || !review.classCode || !review.term || !review.year || !review.location || !review.professor || !review.reviewTitle || !review.review || !review.grade || !review.overallRating || !review.difficulty || !review.workload || !review.takeAgain || !review.professorRating) {
            setMessage('Please fill out all fields.');
            setSeverity('error');
            setOpen(true);
            return;
        }

        if (review.classCode.length !== 3 || isNaN(review.classCode)) {
            setMessage('Class Code should be exactly 3 digits.');
            setSeverity('error');
            setOpen(true);
            return;
        }

        if (review.professor.length > 50) {
            setMessage('Professor name should be no more than 50 characters.');
            setSeverity('error');
            setOpen(true);
            return;
        }

        if (review.reviewTitle.length > 125) {
            setMessage('Review title should be no more than 125 characters.');
            setSeverity('error');
            setOpen(true);
            return;
        }

        if (review.review.length > 750) {
            setMessage('Review should be no more than 750 characters.');
            setSeverity('error');
            setOpen(true);
            return;
        }

        try {
            const reviewData = {
                ...review,
                datePosted: new Date(),
                userId: user.uid
            };

            await addDoc(collection(db, 'subjects', review.subjectCode, 'reviews'), reviewData);

            const userDocRef = doc(db, 'users', user.uid, 'reviewedSubjects', review.subjectCode);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                await updateDoc(userDocRef, {
                    reviewCount: userDoc.data().reviewCount + 1
                });
            } else {
                await setDoc(userDocRef, { reviewCount: 1 });
            }

            setMessage('Review submitted successfully!');
            setSeverity('success');
            setOpen(true);
            setReview({
                subjectCode: '',
                classCode: '',
                term: '',
                year: '',
                location: '',
                professor: '',
                reviewTitle: '',
                review: '',
                grade: '',
                overallRating: '',
                difficulty: '',
                workload: '',
                takeAgain: '',
                professorRating: ''
            });
        } catch (error) {
            console.error("Error adding review: ", error);
            setMessage('Error submitting review. Please try again.');
            setSeverity('error');
            setOpen(true);
        }
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Write a Review
            </Typography>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }}>
                <Box flex={1} p={2} borderRight={{ md: 1 }} borderColor="grey.300">
                    <FormControl component="fieldset" margin="normal" fullWidth>
                        <FormLabel component="legend">Overall Rating</FormLabel>
                        <RadioGroup row name="overallRating" value={review.overallRating} onChange={handleChange}>
                            <FormControlLabel value="1" control={<Radio icon={<SentimentVeryDissatisfiedIcon />} checkedIcon={<SentimentVeryDissatisfiedIcon style={{ color: '#f44336' }} />} />} />
                            <FormControlLabel value="2" control={<Radio icon={<SentimentDissatisfiedIcon />} checkedIcon={<SentimentDissatisfiedIcon style={{ color: '#ff9800' }} />} />} />
                            <FormControlLabel value="3" control={<Radio icon={<SentimentSatisfiedIcon />} checkedIcon={<SentimentSatisfiedIcon style={{ color: '#ffeb3b' }} />} />} />
                            <FormControlLabel value="4" control={<Radio icon={<SentimentSatisfiedAltIcon />} checkedIcon={<SentimentSatisfiedAltIcon style={{ color: '#8bc34a' }} />} />} />
                            <FormControlLabel value="5" control={<Radio icon={<SentimentVerySatisfiedIcon />} checkedIcon={<SentimentVerySatisfiedIcon style={{ color: '#4caf50' }} />} />} />
                        </RadioGroup>
                    </FormControl>
                    <FormControl component="fieldset" margin="normal" fullWidth>
                        <FormLabel component="legend">Class Difficulty</FormLabel>
                        <RadioGroup row name="difficulty" value={review.difficulty} onChange={handleChange}>
                            <FormControlLabel value="1" control={<Radio icon={<SentimentVeryDissatisfiedIcon />} checkedIcon={<SentimentVeryDissatisfiedIcon style={{ color: '#f44336' }} />} />} />
                            <FormControlLabel value="2" control={<Radio icon={<SentimentDissatisfiedIcon />} checkedIcon={<SentimentDissatisfiedIcon style={{ color: '#ff9800' }} />} />} />
                            <FormControlLabel value="3" control={<Radio icon={<SentimentSatisfiedIcon />} checkedIcon={<SentimentSatisfiedIcon style={{ color: '#ffeb3b' }} />} />} />
                            <FormControlLabel value="4" control={<Radio icon={<SentimentSatisfiedAltIcon />} checkedIcon={<SentimentSatisfiedAltIcon style={{ color: '#8bc34a' }} />} />} />
                            <FormControlLabel value="5" control={<Radio icon={<SentimentVerySatisfiedIcon />} checkedIcon={<SentimentVerySatisfiedIcon style={{ color: '#4caf50' }} />} />} />
                        </RadioGroup>
                    </FormControl>
                    <FormControl component="fieldset" margin="normal" fullWidth>
                        <FormLabel component="legend">Workload</FormLabel>
                        <RadioGroup row name="workload" value={review.workload} onChange={handleChange}>
                            <FormControlLabel value="1" control={<Radio icon={<SentimentVeryDissatisfiedIcon />} checkedIcon={<SentimentVeryDissatisfiedIcon style={{ color: '#f44336' }} />} />} />
                            <FormControlLabel value="2" control={<Radio icon={<SentimentDissatisfiedIcon />} checkedIcon={<SentimentDissatisfiedIcon style={{ color: '#ff9800' }} />} />} />
                            <FormControlLabel value="3" control={<Radio icon={<SentimentSatisfiedIcon />} checkedIcon={<SentimentSatisfiedIcon style={{ color: '#ffeb3b' }} />} />} />
                            <FormControlLabel value="4" control={<Radio icon={<SentimentSatisfiedAltIcon />} checkedIcon={<SentimentSatisfiedAltIcon style={{ color: '#8bc34a' }} />} />} />
                            <FormControlLabel value="5" control={<Radio icon={<SentimentVerySatisfiedIcon />} checkedIcon={<SentimentVerySatisfiedIcon style={{ color: '#4caf50' }} />} />} />
                        </RadioGroup>
                    </FormControl>
                    <FormControl component="fieldset" margin="normal" fullWidth>
                        <FormLabel component="legend">Would Take Again</FormLabel>
                        <RadioGroup row name="takeAgain" value={review.takeAgain} onChange={handleChange}>
                            <FormControlLabel value="1" control={<Radio icon={<SentimentVeryDissatisfiedIcon />} checkedIcon={<SentimentVeryDissatisfiedIcon style={{ color: '#f44336' }} />} />} />
                            <FormControlLabel value="2" control={<Radio icon={<SentimentDissatisfiedIcon />} checkedIcon={<SentimentDissatisfiedIcon style={{ color: '#ff9800' }} />} />} />
                            <FormControlLabel value="3" control={<Radio icon={<SentimentSatisfiedIcon />} checkedIcon={<SentimentSatisfiedIcon style={{ color: '#ffeb3b' }} />} />} />
                            <FormControlLabel value="4" control={<Radio icon={<SentimentSatisfiedAltIcon />} checkedIcon={<SentimentSatisfiedAltIcon style={{ color: '#8bc34a' }} />} />} />
                            <FormControlLabel value="5" control={<Radio icon={<SentimentVerySatisfiedIcon />} checkedIcon={<SentimentVerySatisfiedIcon style={{ color: '#4caf50' }} />} />} />
                        </RadioGroup>
                    </FormControl>
                    <FormControl component="fieldset" margin="normal" fullWidth>
                        <FormLabel component="legend">Professor Rating</FormLabel>
                        <RadioGroup row name="professorRating" value={review.professorRating} onChange={handleChange}>
                            <FormControlLabel value="1" control={<Radio icon={<SentimentVeryDissatisfiedIcon />} checkedIcon={<SentimentVeryDissatisfiedIcon style={{ color: '#f44336' }} />} />} />
                            <FormControlLabel value="2" control={<Radio icon={<SentimentDissatisfiedIcon />} checkedIcon={<SentimentDissatisfiedIcon style={{ color: '#ff9800' }} />} />} />
                            <FormControlLabel value="3" control={<Radio icon={<SentimentSatisfiedIcon />} checkedIcon={<SentimentSatisfiedIcon style={{ color: '#ffeb3b' }} />} />} />
                            <FormControlLabel value="4" control={<Radio icon={<SentimentSatisfiedAltIcon />} checkedIcon={<SentimentSatisfiedAltIcon style={{ color: '#8bc34a' }} />} />} />
                            <FormControlLabel value="5" control={<Radio icon={<SentimentVerySatisfiedIcon />} checkedIcon={<SentimentVerySatisfiedIcon style={{ color: '#4caf50' }} />} />} />
                        </RadioGroup>
                    </FormControl>
                </Box>
                <Box flex={2} p={2}>
                    <TextField
                        select
                        label="Subject Code"
                        name="subjectCode"
                        value={review.subjectCode}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    >
                        {subjects.map((subject) => (
                            <MenuItem key={subject.code} value={subject.code}>
                                {subject.name} ({subject.code})
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Class Code"
                        name="classCode"
                        value={review.classCode}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <Box display="flex" justifyContent="space-between">
                        <TextField
                            select
                            label="Term"
                            name="term"
                            value={review.term}
                            onChange={handleChange}
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
                            value={review.year}
                            onChange={handleChange}
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
                        value={review.location}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    >
                        {locationOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Professor"
                        name="professor"
                        value={review.professor}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Review Title"
                        name="reviewTitle"
                        value={review.reviewTitle}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Review"
                        name="review"
                        value={review.review}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={4}
                        margin="normal"
                    />
                    <TextField
                        select
                        label="Grade"
                        name="grade"
                        value={review.grade}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    >
                        {gradeOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>
                    <Button variant="contained" color="primary" onClick={handleSubmit} style={{ marginTop: '16px' }}>
                        Submit Review
                    </Button>
                </Box>
            </Box>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <MuiAlert onClose={handleClose} severity={severity}>
                    {message}
                </MuiAlert>
            </Snackbar>
        </Container>
    );
}

export default WriteReview;
