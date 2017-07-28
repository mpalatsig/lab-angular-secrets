import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http'
import { Observable } from 'rxjs/Rx'
import { environment } from '../environments/environment'
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

export interface User{
  _id:string,
  username:string,
  name: string,
  secret: string,
  updatedAt: Date,
  createdAt: Date,
}

@Injectable()
export class SessionService {
  user: User
  BASE_URL: string = `${environment.BASE_URL}/api/auth`
  startLoginCompleted: boolean = false
  options: Object = {withCredentials: true}

  constructor(private http:Http) {
    this.isLoggedIn().subscribe( (user:User) => {
      console.log(`Welcome de nuevo ${user.username}`)
      this.user = user
      this.startLoginCompleted = true
    }, e => this.startLoginCompleted = true)
  }

  handleError(e) {
    console.error("Error en la llamada a la API")
    return Observable.throw(e.json().message)
  }

  signup(username:string, password:string):Observable<User> {
    return this.http.post(`${this.BASE_URL}/signup`, {username,password}, this.options)
      .map(res => res.json())
      .catch(this.handleError)
  }

  login(username:string, password:string):Observable<User> {
    return this.http.post(`${this.BASE_URL}/login`, {username, password}, this.options)
    .map( res => {
      this.user = res.json();
      return this.user
    })
    .catch(this.handleError)
  }

  isLoggedIn():Observable<User> {
    return this.http.get(`${this.BASE_URL}/loggedin`, this.options)
      .map(res => {
        this.user = res.json()
        return this.user
      })
      .catch(this.handleError)
  }

  logout():Observable<Object> {
    return this.http.get(`${this.BASE_URL}/logout`, this.options)
    .map ( res => {
      res.json()
      this.user = undefined
    })
    .catch(this.handleError)
  }



}
