import React, { useEffect, useState, ChangeEvent } from "react";
import {
    Box,
    Card,
    CardHeader,
    CardContent,
    Typography,
    TextField,
    Button,
    Alert,
    AlertTitle,
    Avatar,
    Stack,
    CircularProgress,
    InputAdornment,
} from "@mui/material";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import KeyRoundedIcon from "@mui/icons-material/KeyRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { useApi } from "../../api/useApi";

/**
 * SettingsPanel – Dark MMO‑RPG UI (MUI)
 * Полностью функционален, работает без CSS‑файла; стили через sx.
 */
export default function SettingsPanel() {
    const api = useApi;

    /* ───── state ───── */
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarVersion, setAvatarVersion] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<"success" | "error">("success");

    /* ───── fetch user ───── */
    useEffect(() => {
        api.getUser().then((res) => {
            const avatar = res.data?.avatarUrl || res.data?.user?.avatarUrl;
            if (avatar) setAvatarUrl(avatar);
        });
    }, []);

    const pushMessage = (msg: string, type: "success" | "error") => {
        setMessage(msg);
        setMessageType(type);
    };

    /* ───── handlers ───── */
    const handleChangePassword = async () => {
        if (newPassword.length < 6) {
            pushMessage("Пароль должен быть не менее 6 символов.", "error");
            return;
        }
        if (newPassword !== confirmPassword) {
            pushMessage("Новый пароль и подтверждение не совпадают.", "error");
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.post("/user/change-password", {
                currentPassword,
                newPassword,
            });
            if (data.success) {
                pushMessage("Пароль успешно изменён.", "success");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                pushMessage(data.message || "Ошибка при смене пароля.", "error");
            }
        } catch (e) {
            console.error("[ChangePassword]", e);
            pushMessage("Сервер не смог сменить пароль.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (file: File) => {
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            pushMessage("Файл превышает 2 МБ.", "error");
            return;
        }
        try {
            const { data } = await api.uploadAvatar(file);
            if (data.success && data.avatarUrl) {
                setAvatarUrl(data.avatarUrl);
                setAvatarVersion(Date.now());
                pushMessage("Аватар обновлён.", "success");
            } else {
                pushMessage("Ошибка при загрузке аватара.", "error");
            }
        } catch (e) {
            console.error("[AvatarUpload]", e);
            pushMessage("Ошибка при загрузке аватара.", "error");
        }
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleAvatarUpload(file);
    };

    const disabled = !currentPassword || !newPassword || !confirmPassword || loading;

    /* ───── palette ───── */
    const bgCard = "#1f2533"; // глубокий тёмно‑синий
    const textPrimary = "#e4e8f2";
    const accent = "#cfa75e"; // золото

    /* ───── ui ───── */
    return (
        <Box
            maxWidth={560}
            mx="auto"
            my={4}
            px={2}
            display="flex"
            flexDirection="column"
            gap={4}
            sx={{ color: textPrimary }}
        >
            <Typography variant="h4" align="center" sx={{ color: accent }} gutterBottom>
                ⚙️ Настройки
            </Typography>

            {/* PASSWORD */}
            <Card elevation={4} sx={{ bgcolor: bgCard, border: `1px solid ${accent}` }}>
                <CardHeader
                    title={
                        <Typography variant="h6" sx={{ color: accent }}>
                            🔒 Смена пароля
                        </Typography>
                    }
                />
                <CardContent>
                    <Stack spacing={2}>
                        {[
                            {
                                label: "Текущий пароль",
                                value: currentPassword,
                                onChange: (v: string) => setCurrentPassword(v),
                            },
                            {
                                label: "Новый пароль",
                                value: newPassword,
                                onChange: (v: string) => setNewPassword(v),
                            },
                            {
                                label: "Подтверждение нового пароля",
                                value: confirmPassword,
                                onChange: (v: string) => setConfirmPassword(v),
                            },
                        ].map((field, idx) => (
                            <TextField
                                key={idx}
                                type="password"
                                label={field.label}
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                fullWidth
                                variant="filled"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            {idx === 0 ? (
                                                <LockRoundedIcon sx={{ color: textPrimary }} />
                                            ) : (
                                                <KeyRoundedIcon sx={{ color: textPrimary }} />
                                            )}
                                        </InputAdornment>
                                    ),
                                    disableUnderline: true,
                                }}
                                sx={{
                                    "& .MuiFilledInput-root": {
                                        bgcolor: "#2a3041",
                                        borderRadius: 1,
                                        color: textPrimary,
                                    },
                                    "& .MuiInputLabel-root": { color: "#9ca3b4" },
                                }}
                            />
                        ))}

                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleChangePassword}
                            disabled={disabled}
                            startIcon={loading ? <CircularProgress size={20} /> : undefined}
                            sx={{
                                bgcolor: accent,
                                color: "#1b1d29",
                                fontWeight: 700,
                                "&:hover": { bgcolor: "#ddb36c" },
                            }}
                            fullWidth
                        >
                            {loading ? "Смена…" : "Сменить пароль"}
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            {/* AVATAR */}
            <Card elevation={4} sx={{ bgcolor: bgCard, border: `1px solid ${accent}` }}>
                <CardHeader
                    title={
                        <Typography variant="h6" sx={{ color: accent }}>
                            🖼️ Аватар
                        </Typography>
                    }
                />
                <CardContent>
                    <Stack spacing={2}>
                        {avatarUrl && (
                            <Avatar
                                src={`http://localhost:5000${avatarUrl}?v=${avatarVersion}`}
                                alt="avatar"
                                sx={{ width: 128, height: 128, border: `2px solid ${accent}` }}
                            />
                        )}
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<UploadFileRoundedIcon />}
                            sx={{
                                borderColor: accent,
                                color: accent,
                                alignSelf: "flex-start",
                                "&:hover": { bgcolor: "rgba(207,167,94,0.08)", borderColor: "#ddb36c" },
                            }}
                        >
                            Загрузить новый аватар
                            <input hidden accept="image/*" type="file" onChange={onFileChange} />
                        </Button>
                        <Typography variant="caption" sx={{ color: "#9ca3b4" }}>
                            Рекомендуемый размер — 300×300 px, JPG/PNG, до 2 МБ.
                        </Typography>
                    </Stack>
                </CardContent>
            </Card>

            {message && (
                <Alert
                    severity={messageType}
                    icon={messageType === "success" ? <CheckCircleIcon /> : <ErrorIcon />}
                    sx={{ bgcolor: bgCard, border: `1px solid ${accent}`, color: textPrimary }}
                >
                    <AlertTitle sx={{ color: accent }}>
                        {messageType === "success" ? "Успех" : "Ошибка"}
                    </AlertTitle>
                    {message}
                </Alert>
            )}
        </Box>
    );
}
