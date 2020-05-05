import React, { Component } from 'react';
import Joke from "./Joke.js";
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import './JokeList.css';

const JOKE_URL = "https://icanhazdadjoke.com/";

class JokeList extends Component {
    static defaultProps = {
        numJokesToGet: 10,
    }

    constructor(props) {
        super(props);
        this.loading = false;
        
        this.handleClick = this.handleClick.bind(this);

        this.state = { jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]") };

        this.seenJokes = new Set(this.state.jokes.map(j=> j.text));
    }
    componentDidMount() {
    if(this.state.jokes.length === 0){
        this.getJokes();
    }
    
    }

    async getJokes(){
        let jokes = [];

        try{
            while (jokes.length < this.props.numJokesToGet) {

                let res = await axios.get(JOKE_URL, { headers: { Accept: "application/json" } });


                let newJoke = res.data.joke;
                if (!this.seenJokes.has(newJoke)) {
                    jokes.push({ id: uuidv4(), text: newJoke, votes: 0 });
                } else {
                    console.log("Found a Duplicate");
                    console.log(newJoke);
                }

            }
            console.log(jokes);

            this.setState((state) => {
                return { jokes: [...state.jokes, ...jokes], loading: false }
            },
                () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
            )
        }
        catch(error){
        alert(error);
        this.setState({loading: false});
        }
        
        

    }

    handleClick(){
        this.setState({ loading: true }, this.getJokes);
        
    }

    handleVote(id,delta){
        this.setState((state)=>{
        return {jokes: state.jokes.map(j => j.id === id ? {...j, votes: j.votes + delta}:j)} 
        }, () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes)) );

        
    }
    render() {
        if(this.state.loading){
            return (<div className="JokeList-spinner">

                <i className="far fa-8x fa-laugh fa-spin"></i>
                <h1 className="JokeList-title">Loading...</h1>
            </div>
            );
        }
        let jokes = this.state.jokes.sort((a,b)=>b.votes-a.votes);


        return (
            <div className="JokeList">
                <div className="JokeList-sidebar">
                    <h1 className="JokeList-title"><span>Dad</span> Jokes</h1>
                    <img src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg' alt="smiley" />
                    <button className="JokeList-getmore" onClick={this.handleClick}>New Jokes</button>
                </div>
                
                <div className="JokeList-jokes">
                    {jokes.map( j => {
                        return <Joke 
                            key={j.id} 
                            votes={j.votes}  
                            text = {j.text} 

                            upvote = {()=> this.handleVote(j.id,1)}
                            downvote={() => this.handleVote(j.id, -1)} />
                    })}
                </div>
            </div>
        )
    }
}

export default JokeList;