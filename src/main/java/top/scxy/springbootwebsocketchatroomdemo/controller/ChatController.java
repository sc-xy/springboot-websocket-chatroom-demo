package top.scxy.springbootwebsocketchatroomdemo.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import top.scxy.springbootwebsocketchatroomdemo.model.Message;

import java.util.logging.Logger;

@Controller
public class ChatController {
    private static final Logger logger = Logger.getLogger(ChatController.class.getName());
    private final SimpMessageSendingOperations messageSendingOperations;
    public ChatController(SimpMessageSendingOperations messageSendingOperations) {
        this.messageSendingOperations = messageSendingOperations;
    }
    // 收到加入消息，将消息发送给所有人，同时存储用户信息
    @MessageMapping("/chat.join")
    @SendTo("/topic/public")
    public Message join(@Payload Message message,
                        SimpMessageHeaderAccessor headerAccessor) {
        logger.info("User joined : " + message.getSender());
        headerAccessor.getSessionAttributes().put("username", message.getSender());
        return message;
    }
    // 收到公共消息，将消息发送给所有人
    @MessageMapping("/chat.sendPublicMessage")
    @SendTo("/topic/public")
    public Message sendPublicMessage(@Payload Message message) {
        logger.info("Received a new public message from " + message.getSender());
        return message;
    }
    // 收到私人消息，将消息发送给指定用户，同时发送给自己
    @MessageMapping("/chat.sendPrivateMessage")
    public void sendPrivateMessage(@Payload Message message) {
        logger.info("Received a new private message from " + message.getSender() + " to " + message.getReceiver());
        messageSendingOperations.convertAndSendToUser(message.getReceiver(), "/private", message);
        messageSendingOperations.convertAndSendToUser(message.getSender(), "/private", message);
    }
}
