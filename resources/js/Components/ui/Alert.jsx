import React from "react";

const Alert = ({ type, title, message }) => {
    const getAlertStyles = () => {
        switch (type) {
            case "success":
                return {
                    bgColor: "bg-blue-500", // Azul Pantene en lugar de verde
                    textColor: "text-white",
                    icon: "✅",
                };
            case "error":
                return {
                    bgColor: "bg-red-500",
                    textColor: "text-white",
                    icon: "❌",
                };
            case "warning":
                return {
                    bgColor: "bg-yellow-500",
                    textColor: "text-black",
                    icon: "⚠️",
                };
            case "info":
                return {
                    bgColor: "bg-blue-400",
                    textColor: "text-white",
                    icon: "ℹ️",
                };
            default:
                return {
                    bgColor: "bg-gray-500",
                    textColor: "text-white",
                    icon: "🔔",
                };
        }
    };

    const { bgColor, textColor, icon } = getAlertStyles();

    return (
        <div
            className={`p-4 rounded-lg shadow-md ${bgColor} ${textColor} mb-4`}
        >
            <div className="flex items-center">
                <span className="text-2xl mr-3">{icon}</span>
                <div>
                    <h4 className="font-bold text-lg">{title}</h4>
                    <p className="text-sm opacity-90">{message}</p>
                </div>
            </div>
        </div>
    );
};

export default Alert;
