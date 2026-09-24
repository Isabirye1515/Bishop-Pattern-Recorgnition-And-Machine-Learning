import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Stack,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FunctionsIcon from "@mui/icons-material/Functions";
import InsightsIcon from "@mui/icons-material/Insights";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import PsychologyIcon from "@mui/icons-material/Psychology";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const symbolData = [
  {
    symbol: "x",
    meaning: "Input feature vector (one data point)",
    melbourne: "[rooms, land size, distance to CBD, age]",
    known: "Yes",
  },
  {
    symbol: "x₁ … x_N",
    meaning: "N data points (subscript = index of point)",
    melbourne: "N houses in the dataset",
    known: "Yes",
  },
  {
    symbol: "t",
    meaning: "Target value(s)",
    melbourne: "Sale price of a house",
    known: "Training only",
  },
  {
    symbol: "w",
    meaning: "Weight / parameter vector (learned, random variable)",
    melbourne: "Coefficients of the pricing formula",
    known: "No — inferred",
  },
  {
    symbol: "y(x, w)",
    meaning: "Model prediction",
    melbourne: "Predicted price",
    known: "Computed",
  },
  {
    symbol: "D",
    meaning: "Dimensionality (number of features)",
    melbourne: "4 in the example",
    known: "Yes",
  },
  {
    symbol: "N",
    meaning: "Number of data points",
    melbourne: "Number of houses",
    known: "Yes",
  },
  {
    symbol: "φ(x)",
    meaning: "Basis function transform of x",
    melbourne: "Polynomial / RBF features",
    known: "Yes",
  },
];

const chapterImportance = [
  { chapter: "Ch1 Intro", importance: 95 },
  { chapter: "Ch2 Prob", importance: 90 },
  { chapter: "Ch3 LinReg", importance: 100 },
  { chapter: "Ch4 LinClass", importance: 85 },
  { chapter: "Ch5 NN", importance: 80 },
  { chapter: "Ch6 Kernel", importance: 75 },
  { chapter: "Ch7 SVM", importance: 65 },
  { chapter: "Ch8 Graphs", importance: 60 },
  { chapter: "Ch9 EM", importance: 70 },
  { chapter: "Ch10 Approx", importance: 55 },
  { chapter: "Ch11 Sampling", importance: 55 },
  { chapter: "Ch12 Latent", importance: 65 },
  { chapter: "Ch13 Seq", importance: 50 },
  { chapter: "Ch14 Combine", importance: 60 },
];

// Illustrative: bias-variance tradeoff curve
const biasVarianceData = [
  { complexity: 1, bias: 9.5, variance: 0.3, total: 9.8 },
  { complexity: 2, bias: 6.2, variance: 0.6, total: 6.8 },
  { complexity: 3, bias: 3.8, variance: 1.1, total: 4.9 },
  { complexity: 4, bias: 2.1, variance: 1.9, total: 4.0 },
  { complexity: 5, bias: 1.2, variance: 2.8, total: 4.0 },
  { complexity: 6, bias: 0.7, variance: 3.9, total: 4.6 },
  { complexity: 7, bias: 0.4, variance: 5.4, total: 5.8 },
  { complexity: 8, bias: 0.25, variance: 7.2, total: 7.45 },
  { complexity: 9, bias: 0.15, variance: 9.1, total: 9.25 },
];

// Illustrative: three learning paradigms' strengths
const paradigmData = [
  { axis: "Point estimate", ML: 100, MAP: 90, FullBayes: 20 },
  { axis: "Uncertainty", ML: 10, MAP: 40, FullBayes: 100 },
  { axis: "Overfit resist", ML: 20, MAP: 70, FullBayes: 95 },
  { axis: "Compute cost", ML: 30, MAP: 50, FullBayes: 95 },
  { axis: "Simplicity", ML: 100, MAP: 75, FullBayes: 30 },
];

const chapters = [
  {
    title: "Ch 1 — Introduction",
    summary:
      "Polynomial curve fitting, probability theory, decision theory, information theory. Symbol conventions established here.",
    key: true,
  },
  {
    title: "Ch 2 — Probability Distributions",
    summary:
      "Bernoulli, multinomial, Gaussian, exponential family, nonparametric methods.",
    key: true,
  },
  {
    title: "Ch 3 — Linear Models for Regression",
    summary:
      "Basis functions, bias-variance decomposition, Bayesian linear regression. Most relevant for Melbourne housing.",
    key: true,
  },
  {
    title: "Ch 4 — Linear Models for Classification",
    summary:
      "Discriminant functions, generative vs. discriminative, logistic regression.",
    key: false,
  },
  {
    title: "Ch 5 — Neural Networks",
    summary: "Feed-forward networks, backpropagation.",
    key: false,
  },
  {
    title: "Ch 6 — Kernel Methods",
    summary: "Dual representation, kernel construction, Gaussian processes.",
    key: false,
  },
  {
    title: "Ch 7 — Sparse Kernel Machines",
    summary: "SVMs, relevance vector machines.",
    key: false,
  },
  {
    title: "Ch 8 — Graphical Models",
    summary: "Bayesian networks, Markov random fields.",
    key: false,
  },
  {
    title: "Ch 9 — Mixture Models & EM",
    summary: "K-means, Gaussian mixtures, EM algorithm.",
    key: false,
  },
  {
    title: "Ch 10 — Approximate Inference",
    summary: "Variational Bayes, expectation propagation.",
    key: false,
  },
  {
    title: "Ch 11 — Sampling Methods",
    summary: "MCMC, Gibbs sampling.",
    key: false,
  },
  {
    title: "Ch 12 — Continuous Latent Variables",
    summary: "PCA, factor analysis.",
    key: false,
  },
  {
    title: "Ch 13 — Sequential Data",
    summary: "HMMs, linear dynamical systems.",
    key: false,
  },
  {
    title: "Ch 14 — Combining Models",
    summary: "Committees, boosting, trees.",
    key: false,
  },
];

const Introduction = () => {
  return (
    <Box sx={{ bgcolor: "#fafafa", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        {/* HEADER */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 4,
            background:
              "linear-gradient(135deg, #1976d2 0%, #512da8 100%)",
            color: "white",
          }}
        >
          <Stack direction="row" spacing={2} >
            <MenuBookIcon sx={{ fontSize: 48 }} />
            <Box>
              <Typography variant="h4" >
                Pattern Recognition and Machine Learning
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Christopher M. Bishop · Springer · 2006
              </Typography>
            </Box>
          </Stack>
          <Typography variant="body1" sx={{ mt: 2, opacity: 0.95 }}>
            A foundational ML textbook presenting the field through a{" "}
            <strong>unified Bayesian framework</strong>. Models produce
            distributions over unknowns rather than single "best" values — this
            is why Bishop distinguishes <code>x</code> (observed data) from{" "}
            <code>w</code> (random variable to be inferred) so carefully.
          </Typography>
        </Paper>

        <Grid container spacing={3} >
          <Grid >
            <Card elevation={2} sx={{ height: "100%" }}>
              <CardContent>
                <Stack direction="row" spacing={1}  >
                  <PsychologyIcon color="primary" />
                  <Typography variant="h6" >
                    The Core Perspective: Bayesian First
                  </Typography>
                </Stack>
                <Typography variant="body2">
                  Unknown quantities are <strong>random variables</strong>. You
                  start with a prior, observe data, and compute a posterior via
                  Bayes' theorem:
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: "#f5f5f5",
                    fontFamily: "monospace",
                    fontSize: 14,
                    overflowX: "auto",
                  }}
                >
                  <div>p(w | t) = p(t | w) · p(w) / p(t)</div>
                  <Divider sx={{ my: 1 }} />
                  <div>p(w) &nbsp;&nbsp;&nbsp;→ prior over weights</div>
                  <div>p(t | w) → likelihood of data given weights</div>
                  <div>p(w | t) → posterior (what we learn)</div>
                  <div>p(t) &nbsp;&nbsp;&nbsp;→ evidence / marginal likelihood</div>
                </Paper>
              </CardContent>
            </Card>
          </Grid>

          <Grid >
            <Card elevation={2} sx={{ height: "100%" }}>
              <CardContent>
                <Stack direction="row" spacing={1} >
                  <InsightsIcon color="secondary" />
                  <Typography variant="h6" >
                    Learning Paradigms
                  </Typography>
                </Stack>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={paradigmData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Maximum Likelihood"
                      dataKey="ML"
                      stroke="#1976d2"
                      fill="#1976d2"
                      fillOpacity={0.35}
                    />
                    <Radar
                      name="MAP"
                      dataKey="MAP"
                      stroke="#f57c00"
                      fill="#f57c00"
                      fillOpacity={0.35}
                    />
                    <Radar
                      name="Full Bayesian"
                      dataKey="FullBayes"
                      stroke="#7b1fa2"
                      fill="#7b1fa2"
                      fillOpacity={0.35}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* SYMBOL TABLE */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Stack direction="row" spacing={1} >
            <FunctionsIcon color="primary" />
            <Typography variant="h6" >
              Essential Symbol Conventions
            </Typography>
          </Stack>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#eeeeee" }}>
                  <TableCell><strong>Symbol</strong></TableCell>
                  <TableCell><strong>Meaning</strong></TableCell>
                  <TableCell><strong>Melbourne Example</strong></TableCell>
                  <TableCell><strong>Known?</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {symbolData.map((row) => (
                  <TableRow key={row.symbol} hover>
                    <TableCell>
                      <code>{row.symbol}</code>
                    </TableCell>
                    <TableCell>{row.meaning}</TableCell>
                    <TableCell>{row.melbourne}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.known}
                        size="small"
                        color={
                          row.known === "Yes"
                            ? "success"
                            : row.known === "No — inferred"
                            ? "error"
                            : "default"
                        }
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Alert severity="info" sx={{ mt: 2 }}>
            <AlertTitle>Why the distinction matters</AlertTitle>
            <code>x</code> is known at prediction time; <code>w</code> is
            unknown and inferred. In the Bayesian view, <code>w</code> has a
            prior <code>p(w)</code> and a posterior <code>p(w | t)</code>. In
            the frequentist view, <code>w</code> is just a fixed constant to be
            estimated.
          </Alert>
        </Paper>

        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Stack spacing={1}  >
            <AutoGraphIcon color="primary" />
            <Typography variant="h6" >
              Linear Model in These Symbols (Melbourne Housing)
            </Typography>
          </Stack>
          <Grid container spacing={3}>
            <Grid >
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: "#f5f5f5",
                  fontFamily: "monospace",
                  fontSize: 13,
                  whiteSpace: "pre-wrap",
                }}
              >
{`y(x, w) = w₀ + w₁·rooms + w₂·land_size
         + w₃·distance + ...

where:
  w = (w₀, w₁, w₂, w₃, ...)ᵀ  ← weight vector
  w₀                           ← bias / intercept
  x = (rooms, land_size, distance, ...)ᵀ

Training: find w that minimizes
  Σₙ (y(xₙ, w) − tₙ)²`}
              </Paper>
            </Grid>
            <Grid>
              <Typography variant="body2" >
                This directly corresponds to{" "}
                <code>LinearRegression().fit(X, y)</code> in scikit-learn:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="X = matrix of all xₙ  (N × D)"
                    secondary="All houses' features"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="y = vector of all tₙ  (N,)"
                    secondary="All sale prices"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="coef_ = fitted w"
                    secondary="Learned pricing coefficients"
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Paper>
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" >
            Bias–Variance Tradeoff (Ch 3)
          </Typography>
          <Typography variant="body2" color="text.secondary" >
            As model complexity grows, bias falls but variance rises. The total
            error is U-shaped — the sweet spot is where the sum is minimized.
            Regularization in PRML is exactly a way to control this tradeoff.
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={biasVarianceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="complexity"
                label={{
                  value: "Model Complexity",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis
                label={{
                  value: "Error",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="bias"
                stroke="#1976d2"
                strokeWidth={2}
                name="Bias²"
              />
              <Line
                type="monotone"
                dataKey="variance"
                stroke="#d32f2f"
                strokeWidth={2}
                name="Variance"
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#2e7d32"
                strokeWidth={3}
                name="Total Error"
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6"  >
            Chapter Importance (for housing regression / general ML)
          </Typography>
          <Typography variant="body2" color="text.secondary" >
            Approximate relevance weight for someone following the Melbourne
            housing regression workflow. Ch 3 (Linear Regression) is the most
            directly applicable.
          </Typography>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chapterImportance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="chapter"
                angle={-35}
                textAnchor="end"
                height={70}
                tick={{ fontSize: 11 }}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="importance" fill="#1976d2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* CHAPTER ACCORDIONS */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6"  >
            Chapter Map (14 Chapters)
          </Typography>
          {chapters.map((ch) => (
            <Accordion key={ch.title} disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack  spacing={1} >
                  <Typography>{ch.title}</Typography>
                  {ch.key && (
                    <Chip
                      label="Key"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  {ch.summary}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>

        <Grid container spacing={3} >
          {[
            {
              title: "Maximum Likelihood (ML)",
              body: "Choose w maximizing p(t | w).",
            },
            {
              title: "Maximum A Posteriori (MAP)",
              body: "Choose w maximizing p(w | t) ∝ p(t | w)p(w).",
            },
            {
              title: "Full Bayesian",
              body: "Keep the entire posterior p(w | t), then integrate over w when predicting.",
            },
            {
              title: "Bias–Variance Tradeoff",
              body: "Underfitting vs. overfitting, controlled by model complexity / regularization.",
            },
            {
              title: "Regularization",
              body: "Add a prior on w (Gaussian → L2/ridge; Laplace → L1/lasso).",
            },
            {
              title: "Evidence / Marginal Likelihood",
              body: "p(t) used for model comparison and hyperparameter selection.",
            },
          ].map((c) => (
            <Grid   key={c.title}>
              <Card elevation={1} sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="subtitle1"  gutterBottom>
                    {c.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {c.body}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" >
            Practical Notes
          </Typography>
          <List dense>
            {[
              "The book uses column vectors throughout: x = (x₁, ..., x_D)ᵀ.",
              "Data is often written as a matrix X of shape N × D, one row per data point.",
              "Subscripts index data points (xₙ), not features.",
              "Feature index is usually written as a superscript or a separate letter (x_j, φ_j(x)).",
              "Bishop uses φ(x) for basis functions — nonlinear transforms of inputs for linear models.",
              "Chinese edition (2026): People's Posts and Telecommunications Press, ISBN 9787115681409.",
              "Official resources: chapter slides, exercise solutions, and all figures are available from the book's website.",
            ].map((note) => (
              <ListItem key={note}>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={note} />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Paper
          elevation={3}
          sx={{
            p: 3,
            bgcolor: "#1e1e1e",
            color: "#e0e0e0",
            fontFamily: "monospace",
          }}
        >
          <Typography
            variant="h6"
   
            sx={{ color: "#90caf9" }}
          >
            Quick Cheat Sheet
          </Typography>
          <Grid container spacing={2}>
            <Grid >
              <pre style={{ margin: 0, fontSize: 13 }}>
{`x        → input features (known)
t        → target values (known during training)
w        → weights (unknown, learned)
y(x, w)  → prediction
N        → number of data points
D        → number of features`}
              </pre>
            </Grid>
            <Grid >
              <pre style={{ margin: 0, fontSize: 13 }}>
{`φ(x)     → basis function transform of x
p(w)     → prior
p(t|w)   → likelihood
p(w|t)   → posterior
p(t)     → evidence
coef_    → fitted w in sklearn`}
              </pre>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default Introduction;