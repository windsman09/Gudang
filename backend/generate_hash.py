import bcrypt

password = input("Masukkan password admin: ").encode("utf-8")

hashed_password = bcrypt.hashpw(
    password,
    bcrypt.gensalt()
)

print("\nHashed password:")
print(hashed_password.decode("utf-8"))
