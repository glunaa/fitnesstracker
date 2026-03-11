import tkinter as tk
from tkinter import ttk, messagebox
import conversion

# ── colour palette ────────────────────────────────────────────────────────────
BG       = "#1e1e2e"
PANEL    = "#2a2a3e"
ACCENT   = "#7c6af7"
ACCENT2  = "#5a4fd4"
FG       = "#e0e0f0"
ENTRY_BG = "#31314a"
RESULT   = "#a8ff78"

# ── helpers ───────────────────────────────────────────────────────────────────
def _style_entry(parent, **kw):
    e = tk.Entry(parent, bg=ENTRY_BG, fg=FG, insertbackground=FG,
                 relief="flat", font=("Segoe UI", 11), **kw)
    e.config(highlightbackground=ACCENT, highlightcolor=ACCENT, highlightthickness=1)
    return e

def _label(parent, text, size=11, bold=False, color=FG):
    weight = "bold" if bold else "normal"
    return tk.Label(parent, text=text, bg=PANEL, fg=color,
                    font=("Segoe UI", size, weight))

def _result_label(parent):
    return tk.Label(parent, text="", bg=PANEL, fg=RESULT,
                    font=("Segoe UI", 13, "bold"), wraplength=380, justify="center")

def _button(parent, text, command):
    btn = tk.Button(parent, text=text, command=command,
                    bg=ACCENT, fg="white", activebackground=ACCENT2,
                    activeforeground="white", relief="flat",
                    font=("Segoe UI", 11, "bold"), padx=20, pady=8, cursor="hand2")
    return btn

def _card(parent):
    frame = tk.Frame(parent, bg=PANEL, padx=24, pady=20)
    return frame

def _row(parent, label_text, entry_width=18):
    row = tk.Frame(parent, bg=PANEL)
    _label(row, label_text).pack(side="left", padx=(0, 10))
    entry = _style_entry(row, width=entry_width)
    entry.pack(side="left")
    return row, entry


# ── tab builders ──────────────────────────────────────────────────────────────

def build_weight_tab(nb):
    tab = tk.Frame(nb, bg=PANEL)
    card = _card(tab)
    card.pack(expand=True, padx=30, pady=30)

    _label(card, "Pounds → Kilograms", size=14, bold=True, color=ACCENT).pack(pady=(0, 16))

    row, entry = _row(card, "Weight (lbs):")
    row.pack(pady=6)

    result = _result_label(card)
    result.pack(pady=12)

    def calculate():
        try:
            kg = conversion.poundsToKilo(entry.get())
            result.config(text=f"{entry.get()} lbs  =  {kg} kg")
        except ValueError:
            messagebox.showerror("Input Error", "Please enter a valid number.")

    _button(card, "Convert", calculate).pack(pady=4)
    return tab


def build_height_tab(nb):
    tab = tk.Frame(nb, bg=PANEL)
    card = _card(tab)
    card.pack(expand=True, padx=30, pady=30)

    _label(card, "Inches → Centimeters", size=14, bold=True, color=ACCENT).pack(pady=(0, 16))

    row, entry = _row(card, "Height (inches):")
    row.pack(pady=6)

    result = _result_label(card)
    result.pack(pady=12)

    def calculate():
        try:
            cm = conversion.feetToCentimeter(entry.get())
            result.config(text=f"{entry.get()} in  =  {cm} cm")
        except ValueError:
            messagebox.showerror("Input Error", "Please enter a valid number.")

    _button(card, "Convert", calculate).pack(pady=4)
    return tab


def build_bmi_tab(nb):
    tab = tk.Frame(nb, bg=PANEL)
    card = _card(tab)
    card.pack(expand=True, padx=30, pady=30)

    _label(card, "BMI Calculator", size=14, bold=True, color=ACCENT).pack(pady=(0, 16))

    row_h, entry_h = _row(card, "Height (cm):")
    row_h.pack(pady=6)
    row_w, entry_w = _row(card, "Weight (kg):")
    row_w.pack(pady=6)

    result = _result_label(card)
    result.pack(pady=12)

    # reference table
    ref = tk.Label(card, text="< 18.5 UnderWeight  |  18.5–24.9 Normal  |  25–29.9 OverWeight  |  ≥ 30 Obese",
                   bg=PANEL, fg="#888aaa", font=("Segoe UI", 9), wraplength=380, justify="center")
    ref.pack()

    def calculate():
        try:
            bmi, category = conversion.bodyMassIndex(entry_h.get(), entry_w.get())
            result.config(text=f"BMI: {bmi}  →  {category}")
        except ValueError:
            messagebox.showerror("Input Error", "Please enter valid numbers.")

    _button(card, "Calculate", calculate).pack(pady=(12, 4))
    return tab


def build_protein_tab(nb):
    tab = tk.Frame(nb, bg=PANEL)
    card = _card(tab)
    card.pack(expand=True, padx=30, pady=30)

    _label(card, "Protein Calculator", size=14, bold=True, color=ACCENT).pack(pady=(0, 16))
    _label(card, "ADA: 1 g protein per kg body weight", size=9, color="#888aaa").pack(pady=(0, 10))

    row, entry = _row(card, "Weight (kg):")
    row.pack(pady=6)

    result = _result_label(card)
    result.pack(pady=12)

    def calculate():
        try:
            grams = conversion.proteinCalculator(entry.get())
            result.config(text=f"Daily protein: {grams} g / day")
        except ValueError:
            messagebox.showerror("Input Error", "Please enter a valid number.")

    _button(card, "Calculate", calculate).pack(pady=4)
    return tab


def build_bmr_tab(nb):
    tab = tk.Frame(nb, bg=PANEL)
    card = _card(tab)
    card.pack(expand=True, padx=30, pady=30)

    _label(card, "Basal Metabolic Rate", size=14, bold=True, color=ACCENT).pack(pady=(0, 16))
    _label(card, "Mifflin-St Jeor formula (male)", size=9, color="#888aaa").pack(pady=(0, 10))

    row_w, entry_w = _row(card, "Weight (kg):")
    row_w.pack(pady=6)
    row_h, entry_h = _row(card, "Height (cm):")
    row_h.pack(pady=6)
    row_a, entry_a = _row(card, "Age:")
    row_a.pack(pady=6)

    result = _result_label(card)
    result.pack(pady=12)

    def calculate():
        try:
            bmr = conversion.basalMetabolicRate(entry_w.get(), entry_h.get(), entry_a.get())
            result.config(text=f"BMR: {bmr} calories / day")
        except ValueError:
            messagebox.showerror("Input Error", "Please enter valid numbers.")

    _button(card, "Calculate", calculate).pack(pady=4)
    return tab


# ── main window ───────────────────────────────────────────────────────────────

def main():
    root = tk.Tk()
    root.title("Fitness Tracker")
    root.geometry("480x360")
    root.resizable(False, False)
    root.configure(bg=BG)

    # header
    header = tk.Frame(root, bg=ACCENT, height=48)
    header.pack(fill="x")
    tk.Label(header, text="Fitness Tracker", bg=ACCENT, fg="white",
             font=("Segoe UI", 15, "bold")).pack(pady=10)

    # notebook (tabs)
    style = ttk.Style()
    style.theme_use("default")
    style.configure("TNotebook",              background=BG, borderwidth=0)
    style.configure("TNotebook.Tab",          background=ENTRY_BG, foreground=FG,
                    padding=[12, 6], font=("Segoe UI", 10))
    style.map("TNotebook.Tab",
              background=[("selected", ACCENT)],
              foreground=[("selected", "white")])

    nb = ttk.Notebook(root)
    nb.pack(fill="both", expand=True, padx=0, pady=0)

    nb.add(build_weight_tab(nb),  text=" lbs→kg ")
    nb.add(build_height_tab(nb),  text=" in→cm  ")
    nb.add(build_bmi_tab(nb),     text="  BMI   ")
    nb.add(build_protein_tab(nb), text="Protein ")
    nb.add(build_bmr_tab(nb),     text="  BMR   ")

    root.mainloop()


if __name__ == "__main__":
    main()
