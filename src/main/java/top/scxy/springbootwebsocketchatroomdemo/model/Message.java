package top.scxy.springbootwebsocketchatroomdemo.model;

public class Message {
    private MessageType type;
    private String content;
    private String sender;
    private String receiver;
    public enum MessageType {
        PUBLIC_CHAT,
        PRIVATE_CHAT,
        JOIN,
        LEAVE
    }
    public MessageType getType() {
        return type;
    }
    public void setType(MessageType type) {
        this.type = type;
    }
    public String getContent() {
        return content;
    }
    public void setContent(String content){
        this.content = content;
    }
    public String getSender() {
        return sender;
    }
    public void setSender(String sender) {
        this.sender = sender;
    }
    public String getReceiver() {
        return receiver;
    }
    public void setReceiver(String receiver){
        this.receiver = receiver;
    }
}
