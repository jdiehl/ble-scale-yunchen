export enum YunchenScaleProfileGender {
  Male = 0,
  Female = 1
}

export interface YunchenScaleProfile {
  gender: YunchenScaleProfileGender
  age: number
  height: number
  waistCircumference?: number
  hipCircumference?: number
}
