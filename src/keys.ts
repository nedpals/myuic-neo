import { Student } from "@myuic-api/types";
import { InjectionKey } from "vue";

// Injection keys
export const studentInjectionKey = <InjectionKey<Student>> Symbol();