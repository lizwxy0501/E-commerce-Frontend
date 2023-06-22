import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { Country } from '../common/country';
import { State } from '../common/state';

@Injectable({
  providedIn: 'root'
})
export class ShopFormService {

  private countriesUrl = 'http://localhost:8080/api/countries';
  private statesUrl = 'http://localhost:8080/api/states';
  
  constructor(private httpClient: HttpClient){

  }

  getCountries(): Observable<Country[]>{
    return this.httpClient.get<GetResponseCountries>(this.countriesUrl).pipe(
      map(response => response._embedded.countries)
    )

  }

  getStates(theCountryCode: string): Observable<State[]>{
    const searchStateUrl = `${this.statesUrl}/search/findByCountryCode?code=${theCountryCode}`;

    return this.httpClient.get<getResponseStates>(searchStateUrl).pipe(
      map(response => response._embedded.states)
    );
  }
  
  getCreditCardMonth(startMonth: number): Observable<number[]> { 

    let data: number[] = [];

    //build an array for 'Month' dropdown list
    //start at current month and loop until 12
    for (let theMonth = startMonth; theMonth <= 12; theMonth++){
      data.push(theMonth);

    }

    return of(data);
  }

  getCreditCardYear(): Observable<number[]> {

    let data: number[] = [];

    //build an array for 'Year' dropdown list
    //start at current month and loop for 10 years

    const startYear: number = new Date().getFullYear();
    const endYear: number = startYear + 10;

    for (let theYear = startYear; theYear <= endYear; theYear++){
      data.push(theYear);
    }

    return of(data);

  }

}

  interface GetResponseCountries{
    _embedded: {
      countries: Country[];
    }
  }

  interface getResponseStates{
    _embedded: {
      states: State[];
    }
  }
