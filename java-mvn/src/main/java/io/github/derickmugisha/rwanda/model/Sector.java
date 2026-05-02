package io.github.derickmugisha.rwanda.model;

import java.util.List;

public class Sector {
  private String id;
  private String name;
  private List<Cell> cells;

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

  public List<Cell> getCells() {
    return cells;
  }

  public void setCells(List<Cell> cells) {
    this.cells = cells;
  }
}
