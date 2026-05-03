import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";

export default function useFlashAlert() {
    const { flash = {} } = usePage().props;

    const [flashModal, setFlashModal] = useState({
        isOpen: false,
        type: "info",
        title: "",
        message: "",
    });

    const normalizeMessage = (value) => {
        if (Array.isArray(value)) return value.join(" ");
        if (typeof value === "object" && value !== null) {
            return Object.values(value).join(" ");
        }
        return value ?? "";
    };

    const openFlash = (type, title, rawMessage) => {
        const message = normalizeMessage(rawMessage);
        if (!message) return;

        setFlashModal({
            isOpen: true,
            type,
            title,
            message,
        });
    };

    useEffect(() => {
        if (flash?.success) {
            openFlash("success", "¡Operación exitosa!", flash.success);
        } else if (flash?.error) {
            openFlash("error", "¡Ups! Algo salió mal", flash.error);
        } else if (flash?.warning) {
            openFlash("warning", "Atención", flash.warning);
        } else if (flash?.info || flash?.status) {
            openFlash("info", "Información", flash.info ?? flash.status);
        }

        const handleCustomFlash = (e) => {
            if (e.detail) {
                openFlash(e.detail.type, e.detail.title, e.detail.message);
            }
        };
        window.addEventListener("show-flash", handleCustomFlash);
        return () => window.removeEventListener("show-flash", handleCustomFlash);
    }, [flash]);

    const closeFlashModal = () => {
        setFlashModal((prev) => ({ ...prev, isOpen: false }));
    };

    return { flashModal, closeFlashModal };
}
