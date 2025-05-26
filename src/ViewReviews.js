import React, { useState, useEffect } from 'react';
import { db, collection, getDocs } from './firebase';
import { TextField, MenuItem, Typography, Container, Card, CardContent, CardActions, Collapse, Button, Paper, Box, Grid } from '@mui/material';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import { subjects } from './subjects'; // Import the subjects array

const gradePoints = {
    "A": 4,
    "B+": 3.5,
    "B": 3,
    "C+": 2.5,
    "C": 2,
    "D": 1,
    "F": 0,
    "W": 0,
    "P": 4
};

const getLetterGrade = (averageGradePoint) => {
    if (averageGradePoint >= 3.75) return "A";
    if (averageGradePoint >= 3.25) return "B+";
    if (averageGradePoint >= 2.75) return "B";
    if (averageGradePoint >= 2.25) return "C+";
    if (averageGradePoint >= 1.75) return "C";
    if (averageGradePoint >= 0.75) return "D";
    return "F";
};

const getFaceIcon = (value) => {
    switch (value) {
        case 1:
            return <SentimentVeryDissatisfiedIcon style={{ color: '#f44336', fontSize: 30 }} />;
        case 2:
            return <SentimentDissatisfiedIcon style={{ color: '#ff9800', fontSize: 30 }} />;
        case 3:
            return <SentimentSatisfiedIcon style={{ color: '#ffeb3b', fontSize: 30 }} />;
        case 4:
            return <SentimentSatisfiedAltIcon style={{ color: '#8bc34a', fontSize: 30 }} />;
        case 5:
            return <SentimentVerySatisfiedIcon style={{ color: '#4caf50', fontSize: 30 }} />;
        default:
            return null;
    }
};

function ViewReviews() {
    const [selectedSubject, setSelectedSubject] = useState('');
    const [reviews, setReviews] = useState([]);
    const [expanded, setExpanded] = useState({});
    const [averages, setAverages] = useState({});

    useEffect(() => {
        const fetchReviews = async () => {
            if (selectedSubject) {
                const reviewsCollection = collection(db, 'subjects', selectedSubject, 'reviews');
                const reviewsSnapshot = await getDocs(reviewsCollection);
                const reviewsList = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setReviews(reviewsList);

                const classRatings = {};
                reviewsList.forEach(review => {
                    if (!classRatings[review.classCode]) {
                        classRatings[review.classCode] = {
                            totalOverallRating: 0,
                            totalDifficulty: 0,
                            totalWorkload: 0,
                            totalTakeAgain: 0,
                            totalGradePoints: 0,
                            count: 0,
                            reviews: []
                        };
                    }
                    classRatings[review.classCode].totalOverallRating += parseInt(review.overallRating);
                    classRatings[review.classCode].totalDifficulty += parseInt(review.difficulty);
                    classRatings[review.classCode].totalWorkload += parseInt(review.workload);
                    classRatings[review.classCode].totalTakeAgain += parseInt(review.takeAgain);
                    classRatings[review.classCode].totalGradePoints += gradePoints[review.grade];
                    classRatings[review.classCode].count += 1;
                    classRatings[review.classCode].reviews.push(review);
                });

                const averages = {};
                Object.keys(classRatings).forEach(classCode => {
                    averages[classCode] = {
                        averageOverallRating: classRatings[classCode].totalOverallRating / classRatings[classCode].count,
                        averageDifficulty: classRatings[classCode].totalDifficulty / classRatings[classCode].count,
                        averageWorkload: classRatings[classCode].totalWorkload / classRatings[classCode].count,
                        averageTakeAgain: classRatings[classCode].totalTakeAgain / classRatings[classCode].count,
                        averageGradePoint: classRatings[classCode].totalGradePoints / classRatings[classCode].count,
                        reviews: classRatings[classCode].reviews
                    };
                });

                setAverages(averages);
            } else {
                setReviews([]);
                setAverages({});
            }
        };

        fetchReviews();
    }, [selectedSubject]);

    const handleExpandClick = (classCode) => {
        setExpanded((prev) => ({ ...prev, [classCode]: !prev[classCode] }));
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                View Reviews
            </Typography>
            <TextField
                select
                label="Subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                fullWidth
                margin="normal"
            >
                {subjects.map((subject) => (
                    <MenuItem key={subject.code} value={subject.code}>
                        {subject.name} ({subject.code})
                    </MenuItem>
                ))}
            </TextField>
            {Object.keys(averages).length > 0 && (
                <div>
                    {Object.keys(averages).map((classCode) => (
                        <Card key={classCode} variant="outlined" style={{ margin: '16px 0' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {classCode}
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6} sm={4} md={2}>
                                        <Typography component="legend">Overall Rating</Typography>
                                        {getFaceIcon(Math.round(averages[classCode].averageOverallRating))}
                                    </Grid>
                                    <Grid item xs={6} sm={4} md={2}>
                                        <Typography component="legend">Class Difficulty</Typography>
                                        {getFaceIcon(Math.round(averages[classCode].averageDifficulty))}
                                    </Grid>
                                    <Grid item xs={6} sm={4} md={2}>
                                        <Typography component="legend">Workload</Typography>
                                        {getFaceIcon(Math.round(averages[classCode].averageWorkload))}
                                    </Grid>
                                    <Grid item xs={6} sm={4} md={2}>
                                        <Typography component="legend">Would Take Again</Typography>
                                        {getFaceIcon(Math.round(averages[classCode].averageTakeAgain))}
                                    </Grid>
                                    <Grid item xs={6} sm={4} md={2}>
                                        <Typography component="legend">Average Grade</Typography>
                                        <Typography variant="h6">{getLetterGrade(averages[classCode].averageGradePoint)}</Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                            <CardActions>
                                <Button onClick={() => handleExpandClick(classCode)} aria-expanded={expanded[classCode]} aria-label="show more">
                                    {expanded[classCode] ? 'Hide Reviews' : 'Show Reviews'}
                                </Button>
                            </CardActions>
                            <Collapse in={expanded[classCode]} timeout="auto" unmountOnExit>
                                <CardContent>
                                    {averages[classCode].reviews.map((review) => (
                                        <Paper key={review.id} style={{ padding: '16px', marginBottom: '16px' }}>
                                            <Box display="flex" flexDirection="column">
                                                <Box display="flex" flexDirection="column" flexGrow={1} mr={1}>
                                                    <Typography variant="h6" style={{ fontWeight: 'bold' }}>{review.reviewTitle}</Typography>
                                                    <Typography paragraph>{review.review}</Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Professor: {review.professor} / {review.term} {review.year}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Grade: {review.grade}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Location: {review.location}
                                                    </Typography>
                                                </Box>
                                                <Box alignSelf="flex-end">
                                                    <Typography variant="body2" color="textSecondary" align="right">
                                                        Date Posted: {new Date(review.datePosted.seconds * 1000).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Grid container spacing={2} mt={2}>
                                                <Grid item xs={6} sm={4} md={2}>
                                                    <Typography component="legend">Overall Rating</Typography>
                                                    {getFaceIcon(parseInt(review.overallRating))}
                                                </Grid>
                                                <Grid item xs={6} sm={4} md={2}>
                                                    <Typography component="legend">Class Difficulty</Typography>
                                                    {getFaceIcon(parseInt(review.difficulty))}
                                                </Grid>
                                                <Grid item xs={6} sm={4} md={2}>
                                                    <Typography component="legend">Workload</Typography>
                                                    {getFaceIcon(parseInt(review.workload))}
                                                </Grid>
                                                <Grid item xs={6} sm={4} md={2}>
                                                    <Typography component="legend">Would Take Again</Typography>
                                                    {getFaceIcon(parseInt(review.takeAgain))}
                                                </Grid>
                                                <Grid item xs={6} sm={4} md={2}>
                                                    <Typography component="legend">Professor Rating</Typography>
                                                    {getFaceIcon(parseInt(review.professorRating))}
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    ))}
                                </CardContent>
                            </Collapse>
                        </Card>
                    ))}
                </div>
            )}
        </Container>
    );
}

export default ViewReviews;
