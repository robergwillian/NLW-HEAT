import styles from './styles.module.scss'
import logoImg from '../../assets/logo.svg'
import { api } from '../../service/api'
import { useEffect, useState } from 'react'
import io from 'socket.io-client'


type TMessage = {
    id: string,
    text: string,
    user: {
        name: string,
        avatar_url: string
    }
}

let messagesQueue: TMessage[] = []


const socket = io('http://localhost:4000')

socket.on('new_message', (newMessage: TMessage) => {
    messagesQueue.push(newMessage)
})



export function MessageList(){

    const [ messages, setMessages ]  = useState<TMessage[]>([])

    useEffect(()=> {
        api.get<TMessage[]>('messages/last3').then(response => {
            setMessages(response.data)
        })
    })
    
    useEffect(() => {
        const timer = setInterval(() => {
            if(messagesQueue.length > 0) {
                setMessages(prevState => [
                    messagesQueue[0],
                    prevState[0],
                    prevState[1],
                ].filter(Boolean))

                messagesQueue.shift()
            }
        }, 3000)

        return () => clearInterval(timer)
    }, [])



    return (
        <div className={styles.messageListWrapper}>
            <img src={logoImg} alt="" />

            <ul className={styles.messageList}>

                {messages.map(message =>{
                    return (
                        <li key={message.id} className={styles.message}>
                            <p className={styles.messageContent}>
                             {message.text}
                            </p>
                            <div className={styles.messageUser}>    
                                <div className={styles.userImage}>
                                    <img src={message.user.avatar_url} alt={message.user.name} />
                                </div>
                                <span>{message.user.name}</span>
                            </div>
                        </li>
                    )
                })}
            </ul>

        </div>
    )
}