import { GrantType } from "./GrantType";
import type { UIElement } from "../uielements/UIElement";

export class GrantTypeD2 extends GrantType {
  name = "D.2";
  templateName = "grant_type_d2_template";
  formTitles: string[] = [];
  form1: UIElement[] = [];
  form2: UIElement[] = [];
  form3: UIElement[] = [];
  form4: UIElement[] = [];
  application: UIElement[] = [];
  guaranteeLetter: UIElement[] | null = null;
}
