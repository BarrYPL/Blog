from hashlib import sha256
from base64 import b64decode
from base64 import b64encode

from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Util.Padding import pad, unpad


def generate_shared_secret_DH():
    print("Get DH parameters")
    g = int(input('g='))
    p = int(input('p='))
    your_private_key = int(input('Your private key='))
    print('Your public key A is :',generate_public_int(g,your_private_key,p))
    other_public_key = int(input("Other public key="))
    return generate_shared_secret(other_public_key,your_private_key,p)

def generate_public_int(g, a, p):
    return g ^ a % p


def generate_shared_secret(A, b, p):
    return A ^ b % p

def encrypt(secret, data):
    secret = sha256(secret.encode('utf8')).digest()
    iv = get_random_bytes(AES.block_size)
    cipher = AES.new(secret, AES.MODE_CBC, iv)
    return b64encode(iv + cipher.encrypt(pad(data.encode('utf-8'),AES.block_size)))

def decrypt(secret, data):
    secret = sha256(secret.encode('utf8')).digest()
    raw = b64decode(data)
    cipher = AES.new(secret, AES.MODE_CBC, raw[:AES.block_size])
    return unpad(cipher.decrypt(raw[AES.block_size:]), AES.block_size)


if __name__ == '__main__':
    
    shared_secret = str(generate_shared_secret_DH())
    

    while True:
        print ("""
        1.Encrypt
        2.Decrypt
        3.Exit
        """)
        ans=input("Option=") 
        if ans=="1": 
            print('ENCRYPTION')
            msg = input('Text to encrypt: ')
            print('Ciphertext:', encrypt(shared_secret,msg).decode('utf-8'))
        elif ans=="2":
            print('\nDECRYPTION')
            cte = input('Ciphertext: ')
            print('Decryped text:', decrypt(shared_secret,cte).decode('utf-8'))
        elif ans=="3":
            exit()