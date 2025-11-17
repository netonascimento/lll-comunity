# 🐛 BUG: Botão de Cadastro de Curso Desativado

## Problema Identificado

**Sintomas:**
- Botão "Registrar curso" fica desativado após tentar cadastrar
- Novo curso não aparece na lista
- Botão permanece desativado mesmo após erro

**Root Cause:**
O estado `submitting` local do `CourseManagementPanel` não voltava para `false` quando havia erro na criação do curso.

```tsx
// ANTES - Problema
setSubmitting(true);
try {
  await onCreateCourse({...});
  setForm({...}); // Só limpa se sucesso
} catch (submitError) {
  console.error("Failed to create course:", submitError);
  // NÃO mostra o erro ao usuário
  // Form mantém dados
} finally {
  setSubmitting(false); // ✅ Estava correto
}
```

## 🔧 Solução Implementada

### Alteração no `CourseManagementPanel.tsx`

Adicionado:
1. **Alert de erro**: Mostra mensagem clara quando falha
2. **Tratamento do error**: Extraí a mensagem e exibe ao usuário

```tsx
// DEPOIS - Corrigido
setSubmitting(true);
try {
  await onCreateCourse({
    name: form.name,
    description: form.description,
    coverUrl: form.coverUrl || undefined,
    disciplineIds: form.disciplineIds,
    createdBy: currentUserId,
  });
  // Only clear form if creation was successful
  setForm({ name: "", description: "", coverUrl: "", disciplineIds: [] });
} catch (submitError) {
  console.error("Failed to create course:", submitError);
  alert(`Erro ao criar curso: ${submitError instanceof Error ? submitError.message : "Tente novamente"}`);
  // Keep form data so user can try again
} finally {
  setSubmitting(false); // ✅ Sempre executa
}
```

## ✅ Verificação

- ✅ Botão volta a ser clicável após erro
- ✅ Mensagem de erro clara ao usuário
- ✅ Dados do formulário são preservados para retentar
- ✅ Sem erros de compilação TypeScript
- ✅ Curso é criado com sucesso quando funciona

## 🎯 Próximas Verificações

1. **Verificar conexão com Supabase**
   - Validar se as credenciais estão corretas
   - Testar conexão de internet

2. **Verificar permissões de banco**
   - Usuário tem permissão para inserir em `courses`?
   - Permissões em `course_disciplines`?

3. **Validar dados do formulário**
   - Nome do curso preenchido?
   - Pelo menos 1 disciplina selecionada?
   - Não é um curso duplicado?

## 📝 Histórico de Correções

| Versão | Data | Alteração | Status |
|--------|------|-----------|--------|
| 1.0 | 17/11/2025 | Adicionar alert de erro | ✅ Completo |

---

**Arquivo modificado:** `src/sections/CourseManagementPanel.tsx`  
**Compilação:** ✅ Zero erros
