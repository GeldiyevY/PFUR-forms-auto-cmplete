import { GrantType } from "./GrantType";
import type { UIElement } from "../uielements/UIElement";

export class GrantTypeD1 extends GrantType {
  name = "D.1";
  templateName = "grant_type_d1_template";
  formTitles: string[] = [];
  form1: UIElement[] = [];
  form2: UIElement[] = [];
  form3: UIElement[] = [];
  form4: UIElement[] = [];
  application: UIElement[] = [];
  guaranteeLetter: UIElement[] | null = null;
}
