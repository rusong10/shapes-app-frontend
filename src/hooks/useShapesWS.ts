"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Shape, ShapeUpdateMessage } from "@/lib/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

export function useShapesWS(shouldConnect = true) {
    const queryClient = useQueryClient();
    const socketRef = useRef<WebSocket | null>(null);

    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const connect = useCallback(() => {
        if (!WS_URL) {
            console.error("WebSocket URL is not defined.");
            return;
        }

        // Close existing connection if any
        if (socketRef.current) {
            socketRef.current.close();
        }

        console.log(`Attempting to connect to WebSocket at ${WS_URL}`);
        const socket = new WebSocket(WS_URL);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("WebSocket connection established for shapes.");
            setIsConnected(true);
            setError(null);

            // Clear any pending reconnect timeout
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
        };

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data) as ShapeUpdateMessage;
                console.log("WebSocket message received:", message);

                switch (message.action) {
                    case "created":
                        queryClient.setQueryData(['shapes'], (oldData: Shape[] | undefined) => {
                            return oldData ? [message.shape, ...oldData] : [message.shape];
                        });
                        break;
                    case "updated":
                        queryClient.setQueryData(['shapes'], (oldData: Shape[] | undefined) => {
                            return oldData?.map(s => s.id === message.shape!.id ? message.shape : s);
                        });
                        break;
                    case "deleted":
                        queryClient.setQueryData(['shapes'], (oldData: Shape[] | undefined) => {
                            return oldData?.filter(s => s.id !== message.shape_id);
                        });
                        break;
                    default:
                        console.warn("Unknown action:", message.action);
                        break;
                }
            } catch (error) {
                console.error("Error processing WebSocket message:", error);
            }
        };

        socket.onclose = (event) => {
            console.log("WebSocket connection closed for shapes:", event.reason);
            setIsConnected(false);

            // Attempt to reconnect after a delay, unless it was a clean close
            if (!event.wasClean) {
                console.log("Attempting to reconnect in 5 seconds...");
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect();
                }, 5000);
            }
        };

        socket.onerror = (error) => {
            console.error("WebSocket error for shapes:", error);
            setIsConnected(false);
            setError("WebSocket connection error");
        };
    }, [queryClient])

    useEffect(() => {
        if (!shouldConnect) return;

        connect();

        // Cleanup on component unmount
        return () => {
            if (socketRef.current) {
                console.log("Closing WebSocket connection for shapes.");
                socketRef.current.close();
            }

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [connect, shouldConnect])

    // Manual reconnect function
    const reconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        connect();
    }, [connect]);

    return {
        isConnected,
        error,
        reconnect
    };
}
