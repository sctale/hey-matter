import { Box, Button, Container, Typography } from "@mui/material";

export interface ErrorFallbackProps {
  error: unknown;
  resetErrorBoundary: () => void;
}

export const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => (
  <Container>
    <Box sx={{ mt: 8, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        应用出现错误
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        {error instanceof Error ? error.message : String(error)}
      </Typography>
      <Button variant="contained" onClick={resetErrorBoundary}>
        重试
      </Button>
    </Box>
  </Container>
);
