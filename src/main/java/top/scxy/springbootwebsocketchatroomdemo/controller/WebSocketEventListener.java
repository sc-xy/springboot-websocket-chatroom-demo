package top.scxy.springbootwebsocketchatroomdemo.controller;


import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import top.scxy.springbootwebsocketchatroomdemo.model.Message;

import java.util.logging.Logger;

/**
 * 事件监听器
 */
@Component
public class WebSocketEventListener {
    private static final Logger logger = Logger.getLogger(WebSocketEventListener.class.getName());
    private final SimpMessageSendingOperations messageSendingOperations;
    public WebSocketEventListener(SimpMessageSendingOperations messageSendingOperations) {
        this.messageSendingOperations = messageSendingOperations;
    }
    // 监听连接事件
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        logger.info("Received a new web socket connection");
    }
    // 监听断连事件，将消息发送给所有人
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.wrap(event.getMessage());
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        if (username != null) {
            Message message = new Message();
            message.setType(Message.MessageType.LEAVE);
            message.setSender(username);
            messageSendingOperations.convertAndSend("/topic/public", message);
            logger.info("User Disconnected : " + username);
        }
    }
}
