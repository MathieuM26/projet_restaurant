import tableRepository from "../repository/tableMemory.repository.js";

class TableService {
  getAll() {
    return tableRepository.getAll();
  }

  getById(id) {
    return tableRepository.getById(id);
  }

  create(tableData) {
    const { number, capacity } = tableData;
    if (!number || !capacity) {
      return { status: 400, error: "Numéro et capacité requis." };
    }
    const created = tableRepository.create(tableData);
    return { status: 201, data: created };
  }

  deleteById(id) {
    return tableRepository.deleteById(id);
  }
}

export default new TableService();
