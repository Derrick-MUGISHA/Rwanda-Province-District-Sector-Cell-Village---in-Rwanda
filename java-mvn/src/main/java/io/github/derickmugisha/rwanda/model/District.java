package io.github.derickmugisha.rwanda.model;

import java.util.List;

public class District {
  private String id;
  private String name;
  private List<Sector> sectors;

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

  public List<Sector> getSectors() {
    return sectors;
  }

  public void setSectors(List<Sector> sectors) {
    this.sectors = sectors;
  }
}
