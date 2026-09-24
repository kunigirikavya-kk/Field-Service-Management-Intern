package com.fsm.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="notifications")
public class Notification {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @Column(name="user_id", nullable=false)
    private Long userId;
    @Column(nullable=false, length=150)
    private String title;
    @Column(nullable=false, columnDefinition="TEXT")
    private String message;
    @Column(nullable=false, length=30)
    private String type="INFO";
    @Column(name="is_read", nullable=false)
    private boolean read=false;
    @Column(name="created_at", nullable=false)
    private LocalDateTime createdAt;

    public Notification(){}
    @PrePersist protected void onCreate(){if(createdAt==null)createdAt=LocalDateTime.now();}
    public Long getId(){return id;} public void setId(Long v){id=v;}
    public Long getUserId(){return userId;} public void setUserId(Long v){userId=v;}
    public String getTitle(){return title;} public void setTitle(String v){title=v;}
    public String getMessage(){return message;} public void setMessage(String v){message=v;}
    public String getType(){return type;} public void setType(String v){type=v;}
    public boolean isRead(){return read;} public void setRead(boolean v){read=v;}
    public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime v){createdAt=v;}
}