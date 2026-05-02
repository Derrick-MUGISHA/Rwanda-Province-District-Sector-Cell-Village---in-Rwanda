package io.github.derickmugisha.rwanda.model;

import java.util.List;

public class Cell {
  private String id;
  private String name;
  private List<Village> villages;

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public List<Village> getVillages() {
    return villages;
  }

  public void setVillages(List<Village> villages) {
    this.villages = villages;
  }
}
