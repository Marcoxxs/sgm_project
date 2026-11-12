function FilhoComponent({ id, nome, cargo, ativo }) {
  return (
    <div>
      <p>{nome} - {cargo} - {id}</p>
      <p>Status do funcionario: {ativo ? "Ativo" : "Inativo"}</p>
    </div>
  );
}

export default FilhoComponent;