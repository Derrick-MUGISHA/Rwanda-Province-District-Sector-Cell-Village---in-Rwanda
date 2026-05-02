package io.github.derickmugisha.rwanda.model;

import java.util.List;

public class RwandaDataset {
  private String country;
  private String version;
  private List<Province> provinces;

  public String getCountry() {
    return country;
  }

  public void setCountry(String country) {
    this.country = country;
  }

  public String getVersion() {
    return version;
  }

  public void setVersion(String version) {
    this.version = version;
  }

  public List<Province> getProvinces() {
    return provinces;
  }

  public void setProvinces(List<Province> provinces) {
    this.provinces = provinces;
  }
}
