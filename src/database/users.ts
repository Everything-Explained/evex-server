import { readFileSync, writeFileSync, existsSync } from 'fs';
import { writeFile } from 'fs/promises';


export type UserObj   = { [key: string]: 'code'|'nocode' };
export type UserState = 'code'|'nocode'|undefined;

if (!existsSync('./users.json')) {
  writeFileSync('./users.json', JSON.stringify({}));
}

export const USERS: UserObj = JSON.parse(readFileSync('./users.json', 'utf-8'));


export function addUser(userid: string) {
  USERS[userid] = 'nocode';
  return saveUsers();
}


export function updateUser(user: string, val: 'code'|'nocode') {
  USERS[user] = val;
  return saveUsers();
}


export function getUserState(userid: string): UserState { return USERS[userid]; }


let fileQueue = -1
;
export function saveUsers() {
  ++fileQueue;
  return new Promise(rs => {
    setTimeout(async () => {
      await writeFile('./users.json', JSON.stringify(USERS, null, 2));
      rs(true);
      --fileQueue;
    }, fileQueue * 250);
  });
}