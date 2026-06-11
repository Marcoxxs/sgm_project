import React, { useState } from "react";
import { AccountCircle, Refresh, Search } from "@mui/icons-material";
import { Box, Button, FormControl, InputAdornment, InputLabel, MenuItem, Select, TextField, IconButton, Paper } from "@mui/material";

function FiltroComponent({ semestres = [], laboratorios = [], onFiltrar }) {
    const [nome, setNome] = useState("");
    const [semestre, setSemestre] = useState("");
    const [laboratorio, setLaboratorio] = useState("");

    const handleFiltrar = () => {
        if (onFiltrar) onFiltrar({ nome, semestre, laboratorio });
    };

    const handleReset = () => {
        setNome("");
        setSemestre("");
        setLaboratorio("");
        if (onFiltrar) onFiltrar({ nome: "", semestre: "", laboratorio: "" });
    };

    return (
        <Paper sx={{ p: 1.25, borderRadius: 3, border: "1px solid #e6eef3" }} elevation={0}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TextField
                    size="small"
                    placeholder="Buscar por nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="action" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ minWidth: 300, bgcolor: "transparent", borderRadius: 1 }}
                />

                <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>Semestre</InputLabel>
                    <Select value={semestre} label="Semestre" onChange={(e) => setSemestre(e.target.value)}>
                        <MenuItem value=""><em>Todos</em></MenuItem>
                        {semestres.map((s, index) => (
                            <MenuItem key={index} value={s}>{s}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Laboratório</InputLabel>
                    <Select value={laboratorio} label="Laboratório" onChange={(e) => setLaboratorio(e.target.value)}>
                        <MenuItem value=""><em>Todos</em></MenuItem>
                        {laboratorios.map((l, index) => (
                            <MenuItem key={index} value={l}>{l}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button variant="contained" color="primary" onClick={handleFiltrar} sx={{ textTransform: "none" }}>
                    Filtrar
                </Button>

                <IconButton aria-label="reset" onClick={handleReset} sx={{ border: "1px solid #e0e0e0" }}>
                    <Refresh />
                </IconButton>
            </Box>
        </Paper>
    );
}

export default FiltroComponent;